import { useContext } from "react";
import  SidebarContext  from "../contexts/SiderbarContext";

const useSidebar = () => useContext(SidebarContext);

export default useSidebar;
