import Navbar from './NavBar';
import Footer from './Footer'

function LayoutPublico({ enlaces, children }) {
return (
<>
<Navbar enlaces={enlaces} />
<Footer />

</>
);
}

export default LayoutPublico;