import SidebarNav from "@/components/SidebarNav";
import { fetchMastersLive } from "@/lib/api";

export default async function Sidebar() {
  const { masters } = await fetchMastersLive();
  return <SidebarNav masters={masters} />;
}
