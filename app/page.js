import Rightbar from "./component/Rightbar";
import Sidebar from "./component/sidebar/Sidebar";
import Topbar from "./component/Topbar";
import Feed from "./Feed";

export default function Home() {
  return (
    <>
      <Topbar />
      <main className="flex w-full min-w-0 max-w-full justify-center gap-0 overflow-x-hidden bg-[#f0f2f5]">
        <Sidebar />
        <Feed />
        <Rightbar />
      </main>
    </>
  );
}
