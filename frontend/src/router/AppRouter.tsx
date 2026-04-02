import { BrowserRouter, Routes, Route } from "react-router-dom"
import DashboardBuilder from "../pages/DashboardBuilder"
import PreviewPage from "../pages/PreviewPage"

export default function AppRouter() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<DashboardBuilder />} />

        <Route path="/preview" element={<PreviewPage />} />

      </Routes>

    </BrowserRouter>

  )

}