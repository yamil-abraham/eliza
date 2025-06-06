// src/services/TwitterMonitorService.ts

import 'reflect-metadata'; // ¡¡Asegúrate de que esta línea sea la PRIMERA!!

// Importamos la clase base 'Service'.
import { Service } from '@elizaos/core';

// Importamos el módulo de 'agent-twitter-client' como un namespace.
import * as TwitterClientModule from 'agent-twitter-client';

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// --- CAMBIO 1: La clase extiende 'Service' e implementa 'initialize' ---
export class TwitterMonitorService extends Service {
  public name = 'TwitterMonitorService';

  // --- CAMBIO 2: Tipo de twitterClient a 'any' y probable instanciación ---
  // Vuelve a 'any' temporalmente para la depuración del tipo.
  // La instanciación la probaremos con 'new TwitterClientModule()'.
  private twitterClient: any; // <-- CAMBIADO a 'any' de nuevo.

  private openai: OpenAI;
  private accountToMonitor: string;
  private monitorInterval: number;
  private lastTweetId: string | undefined;
  private intervalId: NodeJS.Timeout | undefined;

  constructor() {
    super(); // Llama al constructor de la clase base 'Service'.

    this.accountToMonitor = process.env.TWITTER_ACCOUNT_TO_MONITOR || '';
    this.monitorInterval = parseInt(process.env.TWITTER_MONITOR_INTERVAL_MS || '300000', 10);

    if (!this.accountToMonitor) {
      console.warn('TWITTER_ACCOUNT_TO_MONITOR no está configurado. El monitoreo de Twitter no se iniciará.');
    }

    // --- INSTANCIAR TWITTERCLIENT: ¡Prueba esto ahora! ---
    // Si TwitterClientModule.default no existe, y { TwitterClient } no existe,
    // es muy probable que el módulo exporte la clase directamente como su exportación principal.
    this.twitterClient = new (TwitterClientModule as any)({ // <-- ¡PROBANDO ESTO! Convertimos el módulo a 'any' para instanciarlo directamente
      // ... tus credenciales o configuración de Twitter
      // username: process.env.TWITTER_USERNAME,
      // password: process.env.TWITTER_PASSWORD,
      // email: process.env.TWITTER_EMAIL,
      // twoFactorSecret: process.env.TWITTER_2FA_SECRET,
    });
    // Si lo anterior no funciona, intenta:
    // this.twitterClient = new (TwitterClientModule as any).Client({ /* ... */ });
    // O busca en node_modules/agent-twitter-client/dist/types/index.d.ts el nombre de la clase exportada.


    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY no está configurado. La integración con OpenAI no funcionará.');
    }
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    console.log(`[TwitterMonitorService] Monitoreando la cuenta: ${this.accountToMonitor} cada ${this.monitorInterval / 1000} segundos.`);
  }

  // --- NUEVO MÉTODO REQUERIDO: initialize() ---
  // Este es el método abstracto que debe implementar 'Service'.
  // Mueve la lógica de 'onInit' aquí, ya que 'initialize' es el punto de entrada real.
  public async initialize(): Promise<void> { // <-- ¡MÉTODO NUEVO REQUERIDO!
    if (!this.accountToMonitor) {
      return;
    }

    try {
      const latestTweet = await this.twitterClient.getLatestTweet(this.accountToMonitor);
      if (latestTweet) {
        this.lastTweetId = latestTweet.id;
        console.log(`[TwitterMonitorService] Último tweet inicial de @${this.accountToMonitor}: "${latestTweet.text.substring(0, 50)}..." (ID: ${this.lastTweetId})`);
      } else {
        console.log(`[TwitterMonitorService] No se encontraron tweets previos para @${this.accountToMonitor}.`);
      }
    } catch (error) {
      console.error(`[TwitterMonitorService] Error al obtener el último tweet inicial para @${this.accountToMonitor}:`, error);
    }

    // Inicia el chequeo periódico DESPUÉS de la inicialización exitosa.
    this.intervalId = setInterval(() => this.checkForNewPost(), this.monitorInterval);
  }

  // Mantenemos onInit() vacío o lo eliminamos, ya que initialize() lo reemplaza como hook principal.
  // public async onInit(): Promise<void> {
  //   // La lógica principal se ha movido a initialize()
  // }

  public async onDestroy(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('[TwitterMonitorService] Monitoreo de Twitter detenido.');
    }
  }

  private async checkForNewPost(): Promise<void> {
    if (!this.accountToMonitor) {
      return;
    }

    console.log(`[TwitterMonitorService] Verificando nuevos posts para @${this.accountToMonitor}...`);
    try {
      const latestTweet = await this.twitterClient.getLatestTweet(this.accountToMonitor);

      if (latestTweet) {
        if (!this.lastTweetId || latestTweet.id !== this.lastTweetId) {
          console.log(`✨ [TwitterMonitorService] ¡Nuevo post detectado de @${this.accountToMonitor}!`);
          console.log(`   Tweet ID: ${latestTweet.id}`);
          console.log(`   Texto: ${latestTweet.text}`);
          console.log(`   URL: https://twitter.com/${this.accountToMonitor}/status/${latestTweet.id}`);

          if (this.openai) {
            try {
              console.log('[TwitterMonitorService] Consultando la opinión de OpenAI sobre el tweet...');
              const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: `Eres un asistente útil que analiza y da una opinión concisa sobre el contenido de los tweets. Mantén tu respuesta breve y al punto, como si fueras un analista de redes sociales.`,
                  },
                  {
                    role: 'user',
                    content: `Por favor, dame tu opinión sobre el siguiente tweet: "${latestTweet.text}"`,
                  },
                ],
                max_tokens: 150,
                temperature: 0.7,
              });

              const openaiOpinion = completion.choices[0].message.content;
              if (openaiOpinion) {
                console.log(`🤖 [OpenAI Opinión] ${openaiOpinion}`);
              } else {
                console.log('[TwitterMonitorService] OpenAI no devolvió una opinión.');
              }
            } catch (openaiError) {
              console.error('[TwitterMonitorService] Error al comunicarse con la API de OpenAI:', openaiError);
            }
          }

          this.lastTweetId = latestTweet.id;
        } else {
          console.log(`[TwitterMonitorService] No hay nuevos posts para @${this.accountToMonitor}.`);
        }
      } else {
        console.log(`[TwitterMonitorService] No se encontraron tweets para @${this.accountToMonitor}.`);
      }
    } catch (error) {
      console.error(`[TwitterMonitorService] Error al verificar nuevos posts para @${this.accountToMonitor}:`, error);
    }
  }
}