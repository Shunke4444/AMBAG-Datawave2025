import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { api, listGoals } from "../../lib/api";
import ManagerBalanceCard from "../manager/components/ManagerBalanceCard";
import useIsMobile from "../../hooks/useIsMobile";
import ConsistencyStat from "./ConsistencyStat";
import ContributionDiv from "./ContributionDiv";
import DashboardBtns from "./DashboardBtns";
import GoalCards from "../goals/GoalCards";
import GoalCarouselMobile from "../goals/GoalCarouselMobile";
import MemberHeader from "../members/MemberHeader";
import ActionButtons from './ActionButtons';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import CreateGoalModal from "../goals/CreateGoalModal";
import CreateGroupModal from "../groups/CreateGroupModal";
import SplitBill from "../manager/SplitBill";
import { useMembersContext } from "../manager/contexts/MembersContext.jsx";

const ManagerDashboard = ({ onLoan }) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [firstName, setFirstName] = useState("");
  const [profileGroupId, setProfileGroupId] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const { groupId, members } = useMembersContext();
  const [groupLoading, setGroupLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);


  // Fetch user first name
  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const res = await api.getUserProfile(currentUser.uid);
        setFirstName(res?.profile?.first_name || "Manager");
        setProfileGroupId(res?.role?.group_id || "");
        console.log("Fetched profile:", res);
        console.log("Extracted group ID:", res?.role?.group_id);
          } catch (err) {
            setProfileGroupId("");
          }
      };
      fetchProfile();
    }, []);


  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        console.log("🔍 Fetching goals for groupId:", groupId);
        setGoalsLoading(true);
        const data = await listGoals(groupId);
        console.log("✅ Goals fetched:", data);
        setGoals(data || []);
      } catch (err) {
        console.error("❌ Error fetching goals:", err);
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    };
    if (groupId) {
      fetchGoals();
    } else {
      console.log("⚠️ No groupId available, skipping goals fetch");
      setGoalsLoading(false);
    }
  }, [groupId]);

  // Fetch group
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        console.log("🔍 Fetching group...");
        setGroupLoading(true);
        const token = await getAuth().currentUser.getIdToken();
        const res = await api.get(`/groups/my-group`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Group fetched:", res?.data);
        setGroup(res?.data || null);
      } catch (err) {
        console.error("❌ Error fetching group:", err);
        setGroup(null);
      } finally {
        setGroupLoading(false);
      }
    };
    fetchGroup();
  }, []);

  // Map goals
  const mappedGoals = goals
    .map((g) => ({
      ...g,
      amount: g.current_amount ?? 0,
      total: g.goal_amount ?? 0,
      targetDate: g.target_date,
    }))
    .slice(0, 6);

  console.log("📊 ManagerDashboard State:", {
    goals: goals.length,
    mappedGoals: mappedGoals.length,
    goalsLoading,
    group: group ? "exists" : "null",
    groupLoading,
    hasGoals: goals.length > 0,
    hasGroup: group !== null,
    showGoals: !goalsLoading && goals.length > 0,
    showGroup: !groupLoading && group !== null,
    hasData: (!goalsLoading && goals.length > 0) || (!groupLoading && group !== null),
    isLoading: goalsLoading || groupLoading,
    firstName,
    profileGroupId,
    groupId,
    membersCount: members.length
  });

  // Flags
  const hasGoals = goals.length > 0;
  const hasGroup = group !== null;
  const hasMembers = Array.isArray(members) && members.length > 0;

  const showGoals = !goalsLoading && hasGoals;
  const showGroup = (!groupLoading && hasGroup) || hasMembers;

  // Only true if either has goals or group after loading finished
  const hasData = showGoals || showGroup;

  // Loading flags
  const isLeftColumnLoading = groupLoading && !hasMembers;
  const isLoading = goalsLoading || groupLoading;



  const handleOpenSplitBill = (member) => {
    setSelectedMember(member || null); // optional, if you want to open for specific member
    setIsSplitBillOpen(true);
  };

  const handleCloseSplitBill = () => {
    setIsSplitBillOpen(false);
    setSelectedMember(null);
  };

  const handleSaveQuota = (quota) => {
    console.log("Quota saved:", quota);
    // TODO: update backend / state with new quota
    handleCloseSplitBill();
  };


    // ---------- Mobile Layout ----------
    if (isMobile) {
      return (
        <main className="flex flex-col min-h-screen bg-white mb-16 overflow-x-hidden">
          <div className="bg-primary text-white px-4 pb-4 rounded-b-3xl">
            {/* Header */}
            <div className="my-4">
              <MemberHeader userName={firstName || "Manager"} />
            </div>

            {/* Manager Balance */}
            <ManagerBalanceCard />

            {/* Member count */}
            <div className="flex justify-end pr-4 pt-2">
              <span className="text-md font-semibold text-white">
                Current Members: {members.length}
              </span>
            </div>

            {/* Main Content */}
            {isLoading ? (
              // ⏳ Show skeleton while fetching
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-200">Loading...</p>
              </div>
            ) : hasData ? (
              // ✅ Show data
              <>
                {showGoals && (
                  <div className="p-4">
                    <GoalCarouselMobile goals={mappedGoals} />
                  </div>
                )}
              </>
            ) : (
              // 🚫 Empty placeholders
              <div className="flex flex-col items-center justify-center gap-8 bg-shadow rounded-xl px-6 py-12 shadow-md mb-4">
                <p className="text-secondary text-center text-sm sm:text-base md:text-lg lg:text-xl">
                  No data yet
                </p>
                <button
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm sm:text-base md:text-lg px-4 py-2 rounded-xl cursor-pointer"
                  onClick={() => setIsGoalModalOpen(true)}
                >
                  <AddIcon className="text-white text-sm sm:text-base md:text-lg" />
                  <span>Create a Goal</span>
                </button>
                <button
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm sm:text-base md:text-lg px-4 py-2 rounded-xl cursor-pointer"
                  onClick={() => setIsGroupModalOpen(true)}
                >
                  <AddIcon className="text-white text-sm sm:text-base md:text-lg" />
                  <span>Find Your AMBAG Pals!</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-4"> 
            <ActionButtons 
                onLoan={onLoan} 
              />
          </div>
            
          {/* Contribution Div */}
          {showGroup && (
            <div className="p-4">
              <ContributionDiv 
                members={members} 
                  loading={groupLoading} 
                  error={groupLoading ? null : (group ? null : "Failed to load group")}
                />
                  </div>
            )}

          {/* Consistency Stat */}
          <div className="bg-white row-span-3 rounded-2xl p-4 shadow-sm flex items-center justify-center">
            <ConsistencyStat />
          </div>

          {/* Modals */}
          {isGoalModalOpen && (
            <CreateGoalModal
              open={isGoalModalOpen}
              onClose={() => setIsGoalModalOpen(false)}
              onCreateGoal={() => {}}
            />
          )}

          <SplitBill
            open={isSplitBillOpen}
            member={selectedMember}
            onClose={handleCloseSplitBill}
            onSave={handleSaveQuota}
          />
        </main>
      );
    }

    // ---------- Desktop Layout ----------
    return (
      <main className="flex flex-col w-full h-full min-h-screen justify-start mt-24">
        <div className="bg-primary w-full max-w-6xl mx-auto rounded-4xl grid grid-cols-1 md:grid-cols-3 gap-4 p-4 auto-rows-min">

          {/* LEFT COLUMN */}
          {isLeftColumnLoading ? (
            <div className="bg-gray-100 rounded-2xl p-6 col-span-1 flex items-center justify-center">
              <p className="text-gray-500">Loading group...</p>
            </div>
          ) : hasData && showGroup ? (
            <div className="bg-secondary rounded-2xl p-4">
              <ContributionDiv 
                members={members} 
                loading={groupLoading} 
                error={groupLoading ? null : (group ? null : "Failed to load group")}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 col-span-1 flex items-center justify-center border border-gray-200">
              <button
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-xs sm:text-sm md:text-base px-3 py-2 rounded-xl cursor-pointer"
                onClick={() => setIsGroupModalOpen(true)}
              >
                <AddIcon className="text-sm sm:text-base" />
                <span>Find Your AMBAG Pals!</span>
              </button>
            </div>
          )}

          {/* TOP RIGHT (Manager + Goals) */}
          <div
            className={`col-span-2 ${
              hasData ? "bg-secondary" : "bg-gray-50 border border-gray-200"
            } rounded-2xl p-4 h-120 flex flex-col items-center justify-start`}
          >
            <div className="w-full">
              <ManagerBalanceCard />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading goals...</p>
              </div>
            ) : hasData && showGoals ? (
              <div className="w-full mt-4">
                <GoalCards goals={mappedGoals} />
              </div>
            ) : (
              <button
                className="flex items-center gap-2 bg-yellow-200 hover:bg-yellow-300 text-gray-800 text-xs sm:text-sm md:text-base px-4 py-2 rounded-xl cursor-pointer mt-6"
                onClick={() => setIsGoalModalOpen(true)}
              >
                <AddIcon className="text-gray-800 text-sm sm:text-base" />
                <span>Create a Goal</span>
              </button>
            )}
          </div>

          {/* BOTTOM LEFT */}
          <div className="bg-white row-span-3 rounded-2xl p-4 shadow-sm flex items-center justify-center">
            {hasData ? <ConsistencyStat /> : <p className="text-gray-400">No stats yet</p>}
          </div>

          {/* BOTTOM RIGHT */}
          <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
            <DashboardBtns
              onLoan={onLoan}
              onSplitBill={handleOpenSplitBill}
              onPayShare={() => setIsGoalModalOpen(true)}
            />
          </div>
        </div>

        {/* GROUP MODAL */}
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 ">Your Group ID</h2>
              <div className="mb-4 p-2 bg-gray-100 rounded text-center text-lg font-semibold text-primary select-all">
                {groupId ? groupId : "No group ID found"}
              </div>
              <button
                className="px-4 py-2 text-white rounded-lg bg-primary transition-colors"
                onClick={() => setIsGroupModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* GOAL MODAL */}
        {isGoalModalOpen && (
          <CreateGoalModal
            open={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onCreateGoal={async (goalData) => {
              try {
                const { createGoal } = await import("../../lib/api");
                const result = await createGoal(goalData);
                return result;
              } catch (error) {
                console.error("❌ Goal creation error:", error);
                throw error;
              }
            }}
          />
        )}

        {/* QUOTA MODAL */}
        <SplitBill
          open={isSplitBillOpen}
          member={selectedMember}
          onClose={handleCloseSplitBill}
          onSave={handleSaveQuota}
        />
      </main>
    );

};

export default ManagerDashboard;