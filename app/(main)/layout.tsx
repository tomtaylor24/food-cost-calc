import SideBar from "@/app/components/sideBar"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="layout">
      <SideBar />
      {children}
    </div>
  )
}

export default MainLayout
