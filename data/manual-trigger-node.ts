import { NodeTemplate } from "@/types/node-template";

export const manualTriggerNode: NodeTemplate = {
  id: "manual-trigger",
  name: "Iniciar workflow manualmente",
  description: "Inicia o workflow quando o botão é clicado",
  category: "Triggers",
  icon: "Play",
  color: "#FF5C00",
  inputs: [],
  outputs: [
    {
      id: "output",
      name: "Output",
      description: "Saída padrão do trigger manual",
      type: "any"
    }
  ],
  properties: [],
  defaultValues: {},
  nodeType: "trigger",
  executionType: "sync",
  version: "1.0.0",
  tags: ["trigger", "manual", "workflow"]
};
