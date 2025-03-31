import AuthGuard from "../utils/authGuard";

const Browse = () => {
  return (
    <AuthGuard>
      <div>
        {/* Browse content */}
      </div>
    </AuthGuard>
  );
};

export default Browse;
