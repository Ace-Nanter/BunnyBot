import { Presence } from "discord.js";

export class PresenceUtils {

  public static getApplicationIdFromPresence(presence: Presence): string {

    // Return null if presence does not contain any activity
    if (!presence || !presence.activities || presence.activities.length === 0) {
      return null;
    }

    const activitiesWithApplications = presence.activities.filter(a => !!a.applicationId);

    if (!activitiesWithApplications || activitiesWithApplications.length == 0) {
      return null;
    }

    return activitiesWithApplications[0].applicationId;
  }

}