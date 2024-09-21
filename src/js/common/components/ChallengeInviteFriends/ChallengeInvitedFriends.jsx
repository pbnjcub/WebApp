import React from 'react';
import styled from 'styled-components';
import ChallengeFriendInviteList from './ChallengeFriendInviteList';

const ChallengeInvitedFriends = () => {
  return (
    <InvitedFriendsContainer>
      <Heading>
        <p style={{ fontWeight: 'bold', padding: '10px' }}>Invited Friends</p>
      </Heading>
      <ChallengeFriendInviteList />
    </InvitedFriendsContainer>
  );
};

const InvitedFriendsContainer = styled.div`
  max-width: 110vw;
  margin: 0 auto;
`;

const Heading = styled.div`
  padding: 0 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export default ChallengeInvitedFriends;
