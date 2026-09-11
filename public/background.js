const BOARD_KEY = "mynt_scrum_board";
const NOTIFICATION_LOG_KEY = "mynt_scrum_notification_log";
const CHECK_ALARM = "mynt-scrum-check";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 1 });
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== CHECK_ALARM) return;
  const stored = await chrome.storage.local.get([
    BOARD_KEY,
    NOTIFICATION_LOG_KEY,
  ]);
  const board = stored[BOARD_KEY];
  if (!board?.settings?.notificationsEnabled) return;

  const now = Date.now();
  const reminderWindow = (board.settings.reminderMinutes || 30) * 60000;
  const log = stored[NOTIFICATION_LOG_KEY] || {};
  const nextLog = { ...log };
  const doneStatuses = new Set(
    (board.statuses || [{ id: "done", isDone: true }])
      .filter((status) => status.isDone)
      .map((status) => status.id),
  );

  for (const task of board.tasks || []) {
    if (!task.eta || doneStatuses.has(task.status)) continue;
    const eta = new Date(task.eta).getTime();
    const remaining = eta - now;
    const dueSoonKey = `${task.id}:due-soon:${task.eta}`;
    const overdueKey = `${task.id}:overdue:${task.eta}`;

    if (
      board.settings.etaReminders &&
      remaining > 0 &&
      remaining <= reminderWindow &&
      !log[dueSoonKey]
    ) {
      chrome.notifications.create(dueSoonKey, {
        type: "basic",
        iconUrl: "favicon.svg",
        title: `Task due in ${Math.max(1, Math.ceil(remaining / 60000))} minutes`,
        message: `${task.key} · ${task.title}`,
        priority: 2,
      });
      nextLog[dueSoonKey] = new Date().toISOString();
    }

    if (board.settings.overdueReminders && remaining <= 0 && !log[overdueKey]) {
      chrome.notifications.create(overdueKey, {
        type: "basic",
        iconUrl: "favicon.svg",
        title: "Task overdue",
        message: `${task.key} · ${task.title} has passed its ETA.`,
        priority: 2,
      });
      nextLog[overdueKey] = new Date().toISOString();
    }
  }

  if (board.settings.sprintReminders) {
    for (const sprint of board.sprints || []) {
      if (sprint.status !== "active" || !sprint.endDate) continue;
      const end = new Date(`${sprint.endDate}T23:59:59`).getTime();
      const remaining = end - now;
      const key = `${sprint.id}:ending:${sprint.endDate}`;
      if (remaining > 0 && remaining <= 24 * 3600000 && !log[key]) {
        const incomplete = (board.tasks || []).filter(
          (task) =>
            task.sprintId === sprint.id && !doneStatuses.has(task.status),
        ).length;
        chrome.notifications.create(key, {
          type: "basic",
          iconUrl: "favicon.svg",
          title: "Sprint ending soon",
          message: `${sprint.name} ends within 24 hours. ${incomplete} incomplete task${incomplete === 1 ? "" : "s"}.`,
          priority: 1,
        });
        nextLog[key] = new Date().toISOString();
      }
    }
  }

  await chrome.storage.local.set({ [NOTIFICATION_LOG_KEY]: nextLog });
});
