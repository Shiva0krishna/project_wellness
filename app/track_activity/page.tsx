import AuthGuard from "../utils/authGuard";

const TrackActivity = () => {
  return (
    <AuthGuard>
      <div>
        {/* Track activity content */}
      </div>
    </AuthGuard>
  );
};

export default TrackActivity;
