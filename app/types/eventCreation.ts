import type { EventItem } from "./event";

export type EventCreationForm = {
  title: string;
  description: string;
  startDate: string;
  deadline: string;
};

export type CreateEventResponse = {
  event?: EventItem;
  error?: string;
};