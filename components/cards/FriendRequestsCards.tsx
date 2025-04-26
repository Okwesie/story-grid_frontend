import React from 'react';
import '../styles/style.css';


interface FriendRequestCardProps {
  name: string;
  mutualFriends: number;
  timeSent: string;
  onAccept: () => void;
  onDecline: () => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  name,
  mutualFriends,
  timeSent,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="friend-request-card">
      <div className="card-header">
        <h3>{name}</h3>
        <p>{mutualFriends} mutual friends</p>
        <p className="timestamp">{timeSent}</p>
      </div>
      <div className="card-actions">
        <button className="accept-button" onClick={onAccept}>Accept</button>
        <button className="decline-button" onClick={onDecline}>Decline</button>
      </div>
    </div>
  );
};

export default FriendRequestCard;
