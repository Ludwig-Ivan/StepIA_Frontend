import TextField from "@mui/material/TextField";
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
 *  @param {React.CSSProperties} [props.containerStyle] - estilos inline adicionales
 *  @param {SxProps} [props.sx]
 */

function InputComponent({ config, containerStyle, sx, ...ref }) {
  return (
    <div className="input-group" style={containerStyle}>
      <label className="label-custom">{config.label}</label>
      <TextField
        type={config.type}
        name={config.name}
        placeholder={config.placeholder}
        value={config.value}
        onChange={config.func}
        variant="outlined"
        sx={sx}
        {...ref}
      />
    </div>
  );
}

export default InputComponent;
