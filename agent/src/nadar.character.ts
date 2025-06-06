import { ModelProviderName } from "@elizaos/core";
import { ClientRequest } from "http";
import { TwitterMonitorService } from "@elizaos-plugins/eliza-twitter-monitor-plugin";

export const mainCharacter = {
      id: "my-agent",
      name: "My Twitter Monitor Agent",
      description: "An agent that monitors Twitter.",
      plugins: [
        "./plugins/eliza-twitter-monitor-plugin", // <-- ¡Añade esta línea!
        "agent-twitter-client",             // <-- Si agent-twitter-client necesita ser un plugin
        TwitterMonitorService
        ],
    clients: [
          // Asegúrate de que el cliente de Twitter esté habilitado si lo necesitas
          "twitter" // Asegúrate de que el cliente de Twitter esté habilitado si lo necesitas
          
        ],
      model: {
          "provider": "openai",
          "name": "gpt-4"
        }
        // ... otras configuraciones
      }