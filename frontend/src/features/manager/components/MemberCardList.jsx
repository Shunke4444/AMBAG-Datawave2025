import React from 'react';
import { motion } from 'framer-motion';
import { Person as PersonIcon } from '@mui/icons-material';
import MemberCard from './MemberCard';

/**
 * List of member cards with animations and empty state
 * @param {Object} props - Component props
 * @param {Array} props.members - Array of member data
 * @param {Function} props.onMemberClick - Handler for member card clicks
 * @param {Function} props.onNudge - Handler for nudge actions
 */
const MemberCardList = ({ members, onMemberClick, onNudge }) => {
  console.log('MemberCardList members:', members);
  if (members.length === 0) {
    return (
      <section 
        className="text-center py-12"
        role="region"
        aria-label="No members found"
      >
        <PersonIcon 
          className="w-16 h-16 text-gray-300 mx-auto mb-4" 
          aria-hidden="true"
        />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </section>
    );
  }

  return (
    <section 
      className="space-y-3" 
      role="region" 
      aria-label={`${members.length} member${members.length !== 1 ? 's' : ''} found`}
    >
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.01 }}
        >
          <MemberCard
            member={member}
            onClick={onMemberClick}
            onNudge={onNudge}
          />
        </motion.div>
      ))}
    </section>
  );
};

export default MemberCardList;
