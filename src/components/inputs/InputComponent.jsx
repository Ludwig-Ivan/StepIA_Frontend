import { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./InputComponentStyle.css";
/**
 *  @param {Object} props
 *  @param {Object} props.config
 *  @param {string} props.config.label
 *  @param {string} [props.config.id]
 *  @param {string} props.config.name
 *  @param {string} props.config.type
 *  @param {string} props.config.placeholder
 *  @param {type} props.config.value
 *  @param {function} props.config.func
 *  @param {function} [props.config.onBlur]
 *  @param {string} [props.config.autoComplete]
 *  @param {boolean} [props.config.autoFocus]
 *  @param {string} [props.config.error] - mensaje de error inline
 *  @param {string} [props.config.helperText] - texto de ayuda
 *  @param {boolean} [props.config.showToggle] - mostrar/ocultar contraseña
 *  @param {React.CSSProperties} [props.containerStyle] - estilos inline adicionales
 *  @param {SxProps} [props.sx]
 */

function InputComponent({ config, containerStyle, sx, ...ref }) {
  const [visible, setVisible] = useState(false);

  const id = config.id || config.name;
  const hasError = Boolean(config.error);
  const showToggle = Boolean(config.showToggle);
  const fieldType =
    showToggle && config.type === "password" && visible ? "text" : config.type;

  return (
    <div
      className={`input-group${hasError ? " input-group--error" : ""}`}
      style={containerStyle}
    >
      <label className="label-custom" htmlFor={id}>
        {config.label}
      </label>
      <TextField
        id={id}
        type={fieldType}
        name={config.name}
        placeholder={config.placeholder}
        value={config.value}
        onChange={config.func}
        onBlur={config.onBlur}
        autoComplete={config.autoComplete}
        autoFocus={config.autoFocus}
        variant="outlined"
        error={hasError}
        helperText={hasError ? config.error : config.helperText || null}
        FormHelperTextProps={{ role: hasError ? "alert" : undefined }}
        sx={{
          "& .MuiFormHelperText-root": {
            marginLeft: "4px",
            marginRight: 0,
            fontWeight: 500,
          },
          ...sx,
        }}
        InputProps={
          showToggle
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setVisible((v) => !v)}
                      edge="end"
                    >
                      {visible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined
        }
        {...ref}
      />
    </div>
  );
}

export default InputComponent;
