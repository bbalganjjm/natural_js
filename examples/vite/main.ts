import { FrameworkError } from "@bbalganjjm/natural_js";

for (const root of document.querySelectorAll<HTMLElement>("[data-demo]")) {
  const button = root.querySelector<HTMLButtonElement>('[data-action="check"]');
  const status = root.querySelector<HTMLOutputElement>('[data-field="status"]');
  if (!button || !status) {
    throw new FrameworkError({
      code: "DEMO_MARKUP",
      api: "example",
      message: "The authored view needs a check button and status output."
    });
  }

  status.textContent = "ESM ready";
  button.addEventListener("click", () => {
    const result = new FrameworkError({
      code: "IMPORT_OK",
      api: "example",
      message: "Package import works"
    });
    status.textContent = `${result.code}: ${result.message}`;
  });
}
