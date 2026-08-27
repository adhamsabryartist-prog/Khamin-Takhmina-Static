// =========================================================
// Serverless Socket Emulation Engine
// 100% Client-Side / WebRTC / Supabase Socket.io Replacement
// =========================================================

import { getSupabaseClient } from "./supabaseClient";
import { GameEngineService } from "./gameEngineService";
import { MatchmakingService, MatchFoundResult } from "./matchmakingService";
import { getAssetUrl } from "../apiConfig";

export const DEFAULT_SHOP_ITEMS = [
  { id: "frame_lvl_10", name: "إطار المستوى 10", type: "frame", price: 100, image: getAssetUrl("/assets/frame-lvl-10.png") },
  { id: "frame_lvl_20", name: "إطار المستوى 20", type: "frame", price: 250, image: getAssetUrl("/assets/frame-lvl-20.png") },
  { id: "frame_lvl_30", name: "إطار المستوى 30", type: "frame", price: 500, image: getAssetUrl("/assets/frame-lvl-30.png") },
  { id: "frame_lvl_40", name: "إطار المستوى 40", type: "frame", price: 1000, image: getAssetUrl("/assets/frame-lvl-40.png") },
  { id: "frame_lvl_50", name: "إطار المستوى 50", type: "frame", price: 2000, image: getAssetUrl("/assets/frame-lvl-50.png") },
  { id: "animals_frame", name: "إطار فئة الحيوانات", type: "frame", price: 300, image: getAssetUrl("/assets/animals-category-frame-gift.png") },
  { id: "food_frame", name: "إطار فئة الأكلات", type: "frame", price: 300, image: getAssetUrl("/assets/food-category-frame-gift.png") },
  { id: "plants_frame", name: "إطار فئة النباتات", type: "frame", price: 300, image: getAssetUrl("/assets/plants-category-frame-gift.png") },
  { id: "objects_frame", name: "إطار فئة الجماد", type: "frame", price: 300, image: getAssetUrl("/assets/objects-category-frame-gift.png") }
];

export type EventListener = (...args: any[]) => void;

export class ServerlessSocket {
  public id: string;
  public connected: boolean = true;
  public disconnected: boolean = false;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private isSearchingMatch: boolean = false;

  constructor() {
    this.id = `serverless_${Math.random().toString(36).substring(2, 11)}`;
    console.log("[ServerlessSocket] Initialized Serverless Virtual Socket:", this.id);

    // Trigger connect event asynchronously so all listeners registered right after instantiation receive it
    setTimeout(() => {
      this.triggerLocalEvent("connect");
      this.triggerLocalEvent("online_count", { online: 1, total: 1 });
    }, 50);
  }

  public on(event: string, fn: EventListener): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);

    // Also register with GameEngineService for game events
    GameEngineService.on(event, fn);
    return this;
  }

  public once(event: string, fn: EventListener): this {
    const onceWrapper: EventListener = (...args: any[]) => {
      this.off(event, onceWrapper);
      fn(...args);
    };
    return this.on(event, onceWrapper);
  }

  public off(event: string, fn?: EventListener): this {
    if (!fn) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(fn);
      GameEngineService.off(event, fn);
    }
    return this;
  }

  public removeAllListeners(event?: string): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  public disconnect(): this {
    this.connected = false;
    this.disconnected = true;
    this.triggerLocalEvent("disconnect", "io client disconnect");
    return this;
  }

  public connect(): this {
    this.connected = true;
    this.disconnected = false;
    this.triggerLocalEvent("connect");
    return this;
  }

  /**
   * Dispatches events locally to listeners
   */
  public triggerLocalEvent(event: string, ...args: any[]) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(...args);
        } catch (err) {
          console.error(`[ServerlessSocket] Error in listener for "${event}":`, err);
        }
      });
    }
  }

  /**
   * Main Emit Handler - processes player actions, cloud updates & game actions
   */
  public emit(event: string, ...args: any[]): this {
    let payload: any = null;
    let callback: ((...cbArgs: any[]) => void) | null = null;

    for (const arg of args) {
      if (typeof arg === "function") {
        callback = arg;
      } else if (payload === null && arg !== undefined) {
        payload = arg;
      }
    }

    // Process event asynchronously
    this.handleServerlessEvent(event, payload, callback);
    return this;
  }

  private async handleServerlessEvent(
    event: string,
    payload: any,
    callback: ((...args: any[]) => void) | null
  ) {
    console.log(`[ServerlessSocket] Handled Event: "${event}"`, payload);

    switch (event) {
      // -------------------------------------------------------------
      // 1. Player Registration
      // -------------------------------------------------------------
      case "register_player": {
        try {
          const name = (payload?.name || "").trim() || "لاعب تخمينة";
          const avatar = payload?.avatar || getAssetUrl("/assets/avatar-free-boy-01.png");
          const gender = payload?.gender || "boy";
          const selectedFrame = payload?.selectedFrame || "";
          const fingerprint = payload?.fingerprint || "";
          const email = payload?.email || null;
          const xp = typeof payload?.xp === "number" ? payload.xp : 0;

          // Generate Unique Serial & Secret Token
          const randomNum = Math.floor(100000 + Math.random() * 900000);
          const serial = `TK-${randomNum}`;
          const secretToken = `st_${Math.random().toString(36).substring(2)}${Date.now()}`;

          // Save to LocalStorage immediately
          localStorage.setItem("khamin_player_serial", serial);
          localStorage.setItem("khamin_player_name", name);
          localStorage.setItem("khamin_player_avatar", avatar);
          localStorage.setItem("khamin_player_gender", gender);
          localStorage.setItem("khamin_player_frame", selectedFrame);
          localStorage.setItem("khamin_secret_token", secretToken);
          localStorage.setItem("khamin_xp", xp.toString());
          localStorage.setItem("khamin_wins", "0");
          localStorage.setItem("khamin_tokens", "100");
          localStorage.setItem("khamin_keys", "5");
          localStorage.setItem("khamin_streak", "0");

          // Sync to Supabase in background
          try {
            const supabase = getSupabaseClient();
            await supabase.from("players").upsert({
              serial,
              name,
              avatar,
              gender,
              selected_frame: selectedFrame,
              fingerprint,
              email,
              secret_token: secretToken,
              xp,
              wins: 0,
              likes: 0,
              tokens: 100,
              keys: 5,
              streak: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch (dbErr) {
            console.warn("[ServerlessSocket] Supabase register sync error:", dbErr);
          }

          if (callback) {
            callback({
              serial,
              name,
              secretToken,
              success: true,
            });
          }
        } catch (err: any) {
          console.error("[ServerlessSocket] Register error:", err);
          if (callback) callback({ error: "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى." });
        }
        break;
      }

      // -------------------------------------------------------------
      // 2. Fetch Player Data
      // -------------------------------------------------------------
      case "get_player_data": {
        const serial = payload?.serial || localStorage.getItem("khamin_player_serial");
        if (!serial) {
          if (callback) callback({ error: "لم يتم العثور على الحساب" });
          return;
        }

        // Build base player object from LocalStorage
        let playerData: any = {
          serial,
          name: localStorage.getItem("khamin_player_name") || "لاعب تخمينة",
          avatar: localStorage.getItem("khamin_player_avatar") || getAssetUrl("/assets/avatar-free-boy-01.png"),
          gender: localStorage.getItem("khamin_player_gender") || "boy",
          selectedFrame: localStorage.getItem("khamin_player_frame") || "",
          xp: parseInt(localStorage.getItem("khamin_xp") || "0", 10),
          wins: parseInt(localStorage.getItem("khamin_wins") || "0", 10),
          likes: parseInt(localStorage.getItem("khamin_likes") || "0", 10),
          tokens: parseInt(localStorage.getItem("khamin_tokens") || "100", 10),
          keys: parseInt(localStorage.getItem("khamin_keys") || "5", 10),
          streak: parseInt(localStorage.getItem("khamin_streak") || "0", 10),
          secretToken: payload?.secretToken || localStorage.getItem("khamin_secret_token") || "",
          reports: 0,
          reportedSerials: [],
        };

        // Try fetching up-to-date cloud profile from Supabase
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from("players")
            .select("*")
            .eq("serial", serial)
            .single();

          if (data && !error) {
            playerData = {
              ...playerData,
              name: data.name || playerData.name,
              avatar: data.avatar || playerData.avatar,
              gender: data.gender || playerData.gender,
              selectedFrame: data.selected_frame || data.selectedFrame || playerData.selectedFrame,
              xp: typeof data.xp === "number" ? data.xp : playerData.xp,
              wins: typeof data.wins === "number" ? data.wins : playerData.wins,
              likes: typeof data.likes === "number" ? data.likes : playerData.likes,
              tokens: typeof data.tokens === "number" ? data.tokens : playerData.tokens,
              keys: typeof data.keys === "number" ? data.keys : playerData.keys,
              streak: typeof data.streak === "number" ? data.streak : playerData.streak,
            };
          }
        } catch (fetchErr) {
          console.warn("[ServerlessSocket] Supabase fetch player error:", fetchErr);
        }

        if (callback) {
          callback(playerData);
        }
        break;
      }

      // -------------------------------------------------------------
      // 3. Shop & Customization
      // -------------------------------------------------------------
      case "get_shop_items": {
        if (callback) callback(DEFAULT_SHOP_ITEMS);
        break;
      }

      case "update_avatar": {
        if (payload?.avatar) {
          localStorage.setItem("khamin_player_avatar", payload.avatar);
          try {
            const supabase = getSupabaseClient();
            const serial = payload.serial || localStorage.getItem("khamin_player_serial");
            if (serial) {
              await supabase.from("players").update({ avatar: payload.avatar, updated_at: new Date().toISOString() }).eq("serial", serial);
            }
          } catch (e) {}
        }
        if (callback) callback({ success: true });
        break;
      }

      case "update_selected_frame": {
        if (payload?.selectedFrame !== undefined) {
          localStorage.setItem("khamin_player_frame", payload.selectedFrame);
          try {
            const supabase = getSupabaseClient();
            const serial = payload.serial || localStorage.getItem("khamin_player_serial");
            if (serial) {
              await supabase.from("players").update({ selected_frame: payload.selectedFrame, updated_at: new Date().toISOString() }).eq("serial", serial);
            }
          } catch (e) {}
        }
        if (callback) callback({ success: true });
        break;
      }

      // -------------------------------------------------------------
      // 4. Account Deletion
      // -------------------------------------------------------------
      case "delete_account": {
        const serial = payload?.serial || localStorage.getItem("khamin_player_serial");
        if (serial) {
          try {
            const supabase = getSupabaseClient();
            await supabase.from("players").delete().eq("serial", serial);
          } catch (e) {}
        }
        if (callback) callback({ success: true });
        break;
      }

      // -------------------------------------------------------------
      // 5. Social & Leaderboard
      // -------------------------------------------------------------
      case "get_player_rank": {
        if (callback) callback(1);
        break;
      }

      case "get_highest_likes_serial":
      case "get_highest_streak_serial":
      case "get_highest_level_serial": {
        if (callback) callback({ serials: [], value: 0, players: [] });
        break;
      }

      case "get_friends": {
        if (callback) callback({ success: true, friends: [], total: 0 });
        break;
      }

      case "get_friend_requests": {
        if (callback) callback({ success: true, requests: [] });
        break;
      }

      case "get_collection_notifications":
      case "get_admin_messages":
      case "get_like_notifications":
      case "get_friend_accepted_notifications":
      case "get_gift_notifications": {
        if (callback) callback({ success: true, notifications: [], messages: [] });
        break;
      }

      case "check_ad_status":
      case "check_key_ad_status": {
        if (callback) callback({ success: true, canWatch: true });
        break;
      }

      case "set_player_serial_for_socket":
      case "update_player_privacy":
      case "admin_set_admin_status": {
        if (callback) callback({ success: true, adminToken: "serverless_admin" });
        break;
      }

      // -------------------------------------------------------------
      // 6. Matchmaking & Room Handlers
      // -------------------------------------------------------------
      case "find_random_match": {
        this.isSearchingMatch = true;
        const mySerial = payload?.serial || localStorage.getItem("khamin_player_serial") || "P1";
        const myName = payload?.name || localStorage.getItem("khamin_player_name") || "أنا";
        const myAvatar = payload?.avatar || localStorage.getItem("khamin_player_avatar") || getAssetUrl("/assets/avatar-free-boy-01.png");
        const myLevel = parseInt(localStorage.getItem("khamin_xp") || "0", 10) / 100 + 1;
        const gameType = payload?.gameType || "selection";

        const matchResult: MatchFoundResult = await MatchmakingService.findRandomMatch(
          {
            id: mySerial,
            name: myName,
            avatar: myAvatar,
            level: myLevel,
          },
          gameType,
          (statusMsg: string) => {
            this.triggerLocalEvent("matchmaking_status", statusMsg);
          },
          3 // 3s search before falling back to realistic Bot
        );

        if (!this.isSearchingMatch) return; // Cancelled

        // Initialize Room inside GameEngineService
        const room = GameEngineService.createRoom(
          matchResult.roomId,
          [
            {
              id: mySerial,
              name: myName,
              avatar: myAvatar,
              level: myLevel,
              isHost: matchResult.isHost,
            },
            {
              id: matchResult.opponent.id,
              name: matchResult.opponent.name,
              avatar: matchResult.opponent.avatar,
              level: matchResult.opponent.level,
              isBot: !matchResult.isP2P,
            },
          ],
          matchResult.isP2P,
          matchResult.p2pManager
        );

        // Update Client
        this.triggerLocalEvent("match_found", { room, roomId: room.id });
        this.triggerLocalEvent("room_update", room);
        if (callback) callback({ success: true, room });
        break;
      }

      case "leave_matchmaking": {
        this.isSearchingMatch = false;
        MatchmakingService.cancelActiveSearch();
        if (callback) callback({ success: true });
        break;
      }

      // -------------------------------------------------------------
      // 7. Core In-Game Action Routing
      // -------------------------------------------------------------
      default: {
        // Forward all gameplay events directly to GameEngineService
        GameEngineService.handleAction(event, payload);
        if (callback) callback({ success: true });
        break;
      }
    }
  }
}

/**
 * Singleton factory to create or get serverless socket
 */
let serverlessSocketInstance: ServerlessSocket | null = null;

export function getServerlessSocket(): ServerlessSocket {
  if (!serverlessSocketInstance) {
    serverlessSocketInstance = new ServerlessSocket();
  }
  return serverlessSocketInstance;
}
