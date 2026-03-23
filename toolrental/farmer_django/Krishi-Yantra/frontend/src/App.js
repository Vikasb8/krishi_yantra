import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from 'react-bootstrap';
import HomeScreen from './screens/HomeScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ToolScreen from './screens/ToolScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddToolScreen from './screens/AddToolScreen';
import EditToolScreen from './screens/EditToolScreen';

function App() {
  return (
    <Router>
      <Header />
      <main className="app-main py-4">
        <Container fluid="xxl" className="px-3 px-md-4">
          <Routes>
            
            <Route path="/" element={<HomeScreen />} />
            <Route path='/login' element={<LoginScreen />} />
            
            
            <Route path="/tools/:id" element={<ToolScreen />} />
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/add-tool' element={<AddToolScreen />} />
            <Route path='/edit-tool/:id' element={<EditToolScreen />} />
            <Route path='/register' element={<RegisterScreen />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
}

export default App;