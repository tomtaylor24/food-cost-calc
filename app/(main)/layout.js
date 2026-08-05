import SideBar from "@/app/components/sideBar"

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <SideBar />
      {children}
    </div>
  )
}

export default MainLayout
