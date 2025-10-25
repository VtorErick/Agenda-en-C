import { FormEvent, useState } from "react";
import { Modal } from "../Modal";

interface StatementsModalProps {
  onClose: () => void;
}

export function StatementsModal({ onClose }: StatementsModalProps) {
  const [period, setPeriod] = useState<string>("2024-05");
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [generated, setGenerated] = useState<boolean>(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenerated(true);
  };

  return (
    <Modal
      title="Generar estado de cuenta"
      subtitle="Descarga tus movimientos en el formato que prefieras"
      onClose={onClose}
    >
      <form className="statement-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Periodo</span>
          <input
            type="month"
            value={period}
            max={new Date().toISOString().slice(0, 7)}
            onChange={(event) => setPeriod(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Formato</span>
          <div className="format-options">
            <label>
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === "pdf"}
                onChange={() => setFormat("pdf")}
              />
              PDF
            </label>
            <label>
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === "csv"}
                onChange={() => setFormat("csv")}
              />
              CSV
            </label>
          </div>
        </label>

        <div className="form-actions">
          <button type="button" className="button-ghost" onClick={onClose}>
            Cerrar
          </button>
          <button type="submit" className="button-primary">
            Generar estado
          </button>
        </div>
      </form>

      {generated && (
        <div className="download-banner">
          <p>
            Tu estado de cuenta de {period} está listo. Puedes revisarlo en formato {format.toUpperCase()}.
          </p>
          <div className="download-actions">
            <button className="button-primary" type="button">
              Descargar
            </button>
            <button className="button-ghost" type="button" onClick={() => setGenerated(false)}>
              Generar otro
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
