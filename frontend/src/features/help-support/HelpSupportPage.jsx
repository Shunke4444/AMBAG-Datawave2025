import { useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Call as ContactIcon,
  Mail as EmailIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login screen, click 'Forgot Password', and follow the instructions sent to your email."
  },
  {
    question: "What if a member doesn’t contribute on time?",
    answer: "Managers will be notified, and the group can choose how to handle late contributions based on internal rules."
  },
  {
    question: "Can I leave a group pool anytime?",
    answer: "Yes, but the group manager must approve it if contributions or pending actions are involved."
  },
  {
    question: "What happens to unused funds?",
    answer: "Unused funds stay in the pool and can be withdrawn, redistributed, or rolled over to another goal depending on the group’s policy."
  },
  {
    question: "Is my data safe with AMBAG?",
    answer: "Yes. We use bank-grade encryption and comply with data privacy laws to ensure your data is safe."
  },
  {
    question: "Can we set different goals per group?",
    answer: "Absolutely. Each group can create and manage multiple goals based on their needs."
  },
];

const startingTips = [
  {
    question: "How to create an AMBAG account",
    answer:
      `To create an AMBAG account, open the AMBAG app or visit our web portal. Tap “Sign Up”, then enter your full name, mobile number, and a secure password. Verify your account via OTP, and you're in!

Tip:
Use the same mobile number linked to your GCash, Maya, or bank card for faster payment linking.`
  },
  {
    question: "Creating or joining a money pool",
    answer:
      `Once logged in, go to the “Pools” tab. You can create a new pool by naming it, setting a goal, and inviting members. To join an existing pool, ask for an invite link or code from the group manager.

Tip:
Make sure you assign clear goals like “Holiday Fund” or “Team Savings” — it helps keep everyone motivated and aligned.`
  },
  {
    question: "Assigning roles (manager/contributor)",
    answer:
      `When setting up your pool, you can assign roles:

Manager: oversees contributions, approves withdrawals, edits goals.
Contributor: can send funds, request withdrawals, and suggest goals.

You can change roles anytime under the “Members” tab.

Tip:
Have at least 1 manager and 1 contributor to keep fund activities transparent and organized.`
  },
  {
    question: "Understanding how contributions work",
    answer:
      `Each pool sets a contribution amount and schedule (e.g., ₱500 weekly). Contributors are notified when it’s time to send their share, which they can do via linked payment methods.

Tip:
Enable auto-reminders so members never forget to contribute on time.`
  },
  {
    question: "Overview of the dashboard",
    answer:
      `The dashboard gives you a real-time view of:

• Pool balance
• Active members
• Goal progress
• Upcoming contribution dates
• Notifications & approvals

Tip:
Use the “Activity Log” to monitor who contributed or made changes — it’s perfect for transparency.`
  },
  {
    question: "Linking payment methods",
    answer:
      `To link a payment method:

1. Go to Settings → Payment Methods
2. Choose from Bank Card, GCash, Maya, GoTyme, etc.
3. Follow the on-screen instructions to securely link and verify

Tip:
Link at least one e-wallet or card so you can withdraw or contribute without delays.`
  }
];

const HelpSupport = () => {

  
  const navigate = useNavigate();

  return (
    <main className="border-accent border-2 m-4 p-4 sm:p-6 flex flex-col gap-8 
                  w-full lg:max-w-5xl lg:mx-auto">
      <button onClick={() => navigate(-1)} className="flex cursor-pointer hover:bg-gray-200 w-fit p-4 rounded-4xl" >
        <BackIcon />
      </button>
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-primary text-left lg:text-center">How Can We Help?</h1>
      <div className="flex flex-col lg:flex lg:w-full gap-8">
        {/* How to get started with Ambag */}
              <section className="mx-12 py-4 max-w-3xl">  
                <Typography variant="h5" gutterBottom>
                How To Get Started
                </Typography>
                
                {startingTips.map((guide, index) =>(
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                      <Typography fontWeight={600}>{guide.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{guide.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </section>

              {/* FAQs */}
              <section className="mx-12 py-4 max-w-3xl ">
                <Typography variant="h5" gutterBottom>
                Frequently Asked Questions
                </Typography>

                {faqs.map((faq, index) => (
                  <Accordion key={index} fullWidth>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{faq.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </section>
      </div>
       {/* Contact */}
              <section className="mx-12 py-12 max-w-3xl ">
                <Typography variant="h5" gutterBottom>
                  Contact Support
                </Typography>
                <div className="flex gap-12">
                  <span className="flex gap-2 lg:gap-8">
                    <ContactIcon />
                      1212-345-6789
                  </span >
                  <span className="flex gap-2 lg:gap-8">
                    <EmailIcon />
                      support@ambag.ph
                  </span>
                </div>
              </section>
    </main>
  )
}
export default HelpSupport