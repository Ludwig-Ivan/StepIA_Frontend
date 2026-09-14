import "./InputComponentStyle.css";

/**
 *  @param {Object} props
 *  @param {Object} props.config
 *  @param {string} props.config.label
 *  @param {string} props.config.name
 *  @param {string} props.config.type
 *  @param {string} props.config.placeholder
 *  @param {type} props.config.value
 *  @param {function} props.config.func
 *  @param {React.CSSProperties} [props.style] - estilos inline adicionales
 */

function InputComponent({ config, style }) {
  return (
    <div className="input-group" style={style}>
      <label>{config.label}</label>
      <input
        type={config.type}
        name={config.name}
        placeholder={config.placeholder}
        value={config.value}
        onChange={config.func}
      />
    </div>
  );
}

export default InputComponent;
