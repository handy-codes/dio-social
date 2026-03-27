import Rightbar from "./component/Rightbar";
import Sidebar from "./component/sidebar/Sidebar";
import Topbar from "./component/Topbar";
import Feed from "./Feed";

export default function Home({ searchParams }) {
  // Server-side query extraction allows feed filtering before rendering.
  const searchTerm = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <>
      <Topbar />
      <main className="flex w-full min-w-0 max-w-full justify-center gap-0 bg-[#f0f2f5] [overflow-x:clip]">
        <Sidebar />
        <Feed searchTerm={searchTerm} />
        <Rightbar />
      </main>
    </>
  );
}
