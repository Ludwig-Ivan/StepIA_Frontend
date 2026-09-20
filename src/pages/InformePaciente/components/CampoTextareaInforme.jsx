import { Controller } from "react-hook-form";
import InputComponent from "../../../components/inputs/InputComponent.jsx";

function CampoTextareaInforme({ control, name, id, label, error, rows = 4 }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InputComponent
          config={{
            id,
            name,
            label,
            placeholder: label,
            type: "text",
            value: field.value,
            func: field.onChange,
            onBlur: field.onBlur,
            error,
          }}
          multiline
          containerStyle={{
            maxWidth: "none",
            width: "100%",
            height: "fit-content",
          }}
          rows={rows}
        />
      )}
    />
  );
}

export default CampoTextareaInforme;
