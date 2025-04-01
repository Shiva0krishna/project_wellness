import AuthGuard from "../utils/authGuard";

const Browse = () => {
  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl font-bold">Browse</h1>
        <p className="mt-4">Explore various features and functionalities.</p>
      </div>
    </AuthGuard>
  );
};

export default Browse;
