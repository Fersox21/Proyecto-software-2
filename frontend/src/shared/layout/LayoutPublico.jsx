import Navbar from './NavBar';
import Footer from './Footer';
import { Outlet } from 'react-router';

function LayoutPublico({ enlaces }) {
return (
<>

    <Navbar enlaces={enlaces} />
    <main><Outlet /></main>
    <Footer />

</>
);
}

export default LayoutPublico;