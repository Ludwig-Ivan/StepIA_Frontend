import "./ButtonHeaderStyle.css";

/**
 *
 * @param {Object} props
 * @param {Object} props.config
 * @param {String} props.config.text
 * @param {String} props.config.name
 * @param {React.ReactNode} props.children
 * @param {()=>void} [props.onClick]
 * @param {React.CSSProperties} [props.style]
 */

function ButtonHeader({ config, children, ...res }) {
  return (
    <button type="button" name={config.name} className="btn-option" {...res}>
      {children}
      <span>{config.text}</span>
    </button>
  );
}

export default ButtonHeader;
