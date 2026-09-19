import "./ButtonComponentStyle.css";

/**
 *
 * @param {Object} props
 * @param {Object} props.config
 * @param {String} props.config.name
 * @param {String} props.config.text
 * @param {"button"|"submit"|"reset"} props.config.type
 * @param {"green"|"white"|"blue"|"purple"} props.config.variant
 * @param {boolean} [props.config.disabled=false]
 * @param {boolean} [props.config.loading=false]
 * @param {string} [props.config.loadingText]
 *
 */
function ButtonComponent({ config, ...rest }) {
  const loading = Boolean(config.loading);
  return (
    <button
      type={config.type || "button"}
      className={`btn btn-${config.variant}${loading ? " btn--loading" : ""}`}
      name={config.name}
      disabled={config.disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          {config.loadingText || config.text}
        </>
      ) : (
        config.text
      )}
    </button>
  );
}

export default ButtonComponent;
