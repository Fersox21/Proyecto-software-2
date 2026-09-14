import Navbar from './NavBar';
import Footer from './Footer';

function LayoutPublico({ enlaces, children }) {
return (
<>

    <Navbar enlaces={enlaces} />
    <Main><Outlet /></Main>
    <Footer />

</>
);
}

export default LayoutPublico;