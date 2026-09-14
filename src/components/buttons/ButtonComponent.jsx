import "./ButtonComponentStyle.css";

/**
 *
 * @param {Object} props
 * @param {Object} props.config
 * @param {String} props.config.name
 * @param {String} props.config.text
 * @param {"green"|"white"|"blue"} props.config.variant
 * @param {boolean} [props.config.disabled=false]
 *
 */
function ButtonComponent({ config, ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn-${config.variant}`}
      name={config.name}
      {...rest}
    >
      {config.text}
    </button>
  );
}

export default ButtonComponent;
