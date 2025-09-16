import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/main.css';

import Layout from './components/Layout/Layout';
import { MessageProvider } from './contexts/MessageContext';
import Dashboard from './pages/Dashboard';
import OrganisationDetails from './pages/Configuration/OrganisationDetails';
import Departments from './pages/Configuration/Departments';
import ProgramTypes from './pages/Configuration/ProgramTypes';
import ProgramModes from './pages/Configuration/ProgramModes';
import Programs from './pages/Configuration/Programs';
import BOSMembers from './pages/Configuration/BOSMembers';
import Users from './pages/Configuration/Users';
import CourseTypes from './pages/Configuration/CourseTypes';
import DeliveryMethods from './pages/Configuration/DeliveryMethods';
import LabCategories from './pages/Configuration/LabCategories';
import BloomsTaxonomy from './pages/Configuration/BloomsTaxonomy';
import Weightage from './pages/Configuration/Weightage';
import DepartmentDesign from './pages/Curriculum/DepartmentDesign';
import CurriculumRegulations from './pages/Curriculum/CurriculumRegulations';
import PEOs from './pages/Curriculum/PEOs';
import ProgramOutcomes from './pages/Curriculum/ProgramOutcomes';
import POtoPEOMapping from './pages/Curriculum/POtoPEOMapping';
import CurriculumSettings from './pages/Curriculum/CurriculumSettings';
import CourseList from './pages/Curriculum/CourseList';
import CourseOutcomes from './pages/Curriculum/CourseOutcomes';
import COtoPOMapping from './pages/Curriculum/COtoPOMapping';
import TopicsAndTLOs from './pages/Curriculum/TopicsAndTLOs';
import LabExperiments from './pages/Curriculum/LabExperiments';
import CurriculumTermDetails from './pages/Curriculum/CurriculumTermDetails';
// Reports
import AcademicReports from './pages/Reports/AcademicReports';
import AssessmentReports from './pages/Reports/AssessmentReports';
import AnalyticsDashboard from './pages/Reports/AnalyticsDashboard';
// Assessment Planning
import AssessmentMethods from './pages/Assessment/AssessmentMethods';
import RubricDesign from './pages/Assessment/RubricDesign';
import EvaluationCriteria from './pages/Assessment/EvaluationCriteria';
// Attainment Analysis
import POAttainment from './pages/Attainment/POAttainment';
import COAttainment from './pages/Attainment/COAttainment';
import GapAnalysis from './pages/Attainment/GapAnalysis';
// Surveys
import StudentFeedback from './pages/Surveys/StudentFeedback';
import FacultyFeedback from './pages/Surveys/FacultyFeedback';
import StakeholderSurveys from './pages/Surveys/StakeholderSurveys';
// Faculty
import FacultyProfilePage from './pages/Faculty/FacultyProfilePage';
import FacultyWorkload from './pages/Faculty/FacultyWorkload';
import FellowshipScholarship from './pages/Faculty/FellowshipScholarship';
import JournalEditorial from './pages/Faculty/JournalEditorial';
import AcademicBodies from './pages/Faculty/AcademicBodies';
import PatentInnovation from './pages/Faculty/PatentInnovation';
import ProfessionalBodies from './pages/Faculty/ProfessionalBodies';
import ResearchProjects from './pages/Faculty/ResearchProjects';
import ResearchPublication from './pages/Faculty/ResearchPublication';
import SeminarTraining from './pages/Faculty/SeminarTraining';
import SponsoredProjects from './pages/Faculty/SponsoredProjects';
import TechnicalTalk from './pages/Faculty/TechnicalTalk';
import FacultyInternship from './pages/Faculty/FacultyInternship';
import EContentDevelopment from './pages/Faculty/EContentDevelopment';
import CoursesCompleted from './pages/Faculty/CoursesCompleted';
import ConsultancyTesting from './pages/Faculty/ConsultancyTesting';
import ConferenceOrganized from './pages/Faculty/ConferenceOrganized';
import BookPublished from './pages/Faculty/BookPublished';
import BookChapter from './pages/Faculty/BookChapter';
import AwardsHonors from './pages/Faculty/AwardsHonors';
// Utilities
import ImportExport from './pages/Utilities/ImportExport';
import SystemSettings from './pages/Utilities/SystemSettings';
import BackupRestore from './pages/Utilities/BackupRestore';

function App() {
  return (
    <MessageProvider>
      <Router>
        <div className="app">
          <Layout>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/configuration/organisation" element={<OrganisationDetails />} />
            <Route path="/configuration/departments" element={<Departments />} />
            <Route path="/configuration/program-types" element={<ProgramTypes />} />
            <Route path="/configuration/program-modes" element={<ProgramModes />} />
            <Route path="/configuration/programs" element={<Programs />} />
            <Route path="/configuration/users" element={<Users />} />
            <Route path="/configuration/bos-members" element={<BOSMembers />} />
            <Route path="/configuration/course-types" element={<CourseTypes />} />
            <Route path="/configuration/delivery-methods" element={<DeliveryMethods />} />
            <Route path="/configuration/lab-categories" element={<LabCategories />} />
            <Route path="/configuration/blooms-taxonomy" element={<BloomsTaxonomy />} />
            <Route path="/configuration/weightage" element={<Weightage />} />
            <Route path="/curriculum/department-details" element={<DepartmentDesign />} />
            <Route path="/curriculum/regulations" element={<CurriculumRegulations />} />
            <Route path="/curriculum/peos" element={<PEOs />} />
            <Route path="/curriculum/program-outcomes" element={<ProgramOutcomes />} />
            <Route path="/curriculum/po-peo-mapping" element={<POtoPEOMapping />} />
            <Route path="/curriculum/settings" element={<CurriculumSettings />} />
            <Route path="/curriculum/courses" element={<CourseList />} />
            <Route path="/curriculum/course-outcomes" element={<CourseOutcomes />} />
            <Route path="/curriculum/co-po-mapping" element={<COtoPOMapping />} />
            <Route path="/curriculum/topics-tlos" element={<TopicsAndTLOs />} />
            <Route path="/curriculum/lab-experiments" element={<LabExperiments />} />
            <Route path="/curriculum/term-details" element={<CurriculumTermDetails />} />
            {/* Reports */}
            <Route path="/reports/academic" element={<AcademicReports />} />
            <Route path="/reports/assessment" element={<AssessmentReports />} />
            <Route path="/reports/analytics" element={<AnalyticsDashboard />} />
            {/* Assessment Planning */}
            <Route path="/assessment/methods" element={<AssessmentMethods />} />
            <Route path="/assessment/rubrics" element={<RubricDesign />} />
            <Route path="/assessment/criteria" element={<EvaluationCriteria />} />
            {/* Attainment Analysis */}
            <Route path="/attainment/po" element={<POAttainment />} />
            <Route path="/attainment/co" element={<COAttainment />} />
            <Route path="/attainment/gap" element={<GapAnalysis />} />
            {/* Surveys */}
            <Route path="/surveys/student" element={<StudentFeedback />} />
            <Route path="/surveys/faculty" element={<FacultyFeedback />} />
            <Route path="/surveys/stakeholder" element={<StakeholderSurveys />} />
            {/* Faculty */}
            <Route path="/faculty/profile" element={<FacultyProfilePage />} />
            <Route path="/faculty/workload" element={<FacultyWorkload />} />
            <Route path="/faculty/fellowship-scholarship" element={<FellowshipScholarship />} />
            <Route path="/faculty/journal-editorial" element={<JournalEditorial />} />
            <Route path="/faculty/academic-bodies" element={<AcademicBodies />} />
            <Route path="/faculty/patent-innovation" element={<PatentInnovation />} />
            <Route path="/faculty/professional-bodies" element={<ProfessionalBodies />} />
            <Route path="/faculty/research-projects" element={<ResearchProjects />} />
            <Route path="/faculty/research-publication" element={<ResearchPublication />} />
            <Route path="/faculty/seminar-training-attended" element={<SeminarTraining />} />
            <Route path="/faculty/sponsored-projects" element={<SponsoredProjects />} />
            <Route path="/faculty/technical-talk" element={<TechnicalTalk />} />
            <Route path="/faculty/internship-training" element={<FacultyInternship />} />
            <Route path="/faculty/econtent-moocs" element={<EContentDevelopment />} />
            <Route path="/faculty/courses-completed" element={<CoursesCompleted />} />
            <Route path="/faculty/consultancy-testing" element={<ConsultancyTesting />} />
            <Route path="/faculty/conference-organized" element={<ConferenceOrganized />} />
            <Route path="/faculty/book-published" element={<BookPublished />} />
            <Route path="/faculty/book-chapter" element={<BookChapter />} />
            <Route path="/faculty/awards-honors" element={<AwardsHonors />} />
            {/* Utilities */}
            <Route path="/utilities/import-export" element={<ImportExport />} />
            <Route path="/utilities/settings" element={<SystemSettings />} />
            <Route path="/utilities/backup" element={<BackupRestore />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </MessageProvider>
  );
}

export default App;
