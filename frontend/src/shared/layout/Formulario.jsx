const [valores, setValores] = useState({ nombre : '', email : ''})

function handleChange(e) {
    const { name, value} = e.target
    setValores({...valores, [name]: value})
}

function Formulario(){

    return (
    <>
        <h2 class="form-tit">Registrate</h2>
        <form class="formulario-registro" method="post">

            <label for="nombre">Nombre completo</label>
            <input class="form1" type="text" name="nombre" required onChange={ (e) => setNombre(e.target.value)}/> <br/>

            <label for="correo">Correo electronico</label>
            <input class="form1" type="email" name="correo" required/> <br/>
            <p>Ejemplo: nombre@mail.com</p>

            <label for="naci">Fecha de nacimiento</label>
            <input class="form1" type="date" name="naci" required min="1936-01-01" max="2020-01-01"/> <br/>

            <label for="civil">Estado civil</label>
            <select class="form1" name="civil" required>
                <option value="" disabled selected>Selecciona..</option>
                <option value="soltera">soltera/o</option>
                <option value="casada">casada/o</option>
                <option value="divorciada">divorciada/o</option>
                <option value="viuda">viuda/o</option>
            </select> <br/>

            <label for="laburo">Describa su situacion laboral</label>
            <textarea class="form1" name="laburo"></textarea> <br/>

            <label for="enviar">Enviar</label>
            <input class="form1" type="submit" name="enviar"/>

        </form>
    </>);
}

export default Formulario;