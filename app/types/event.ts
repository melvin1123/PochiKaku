export type EventStatus = "Ongoing" | "Upcoming" | "Ended";

export type EventReferenceImage = {
  id: string;
  imageUrl: string;
};

export type EventCreator = {
  id: string;
  username: string;
};

export type EventParticipant = {
  id: string;
  username: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  img: string;
  date: string;
  status: EventStatus;
  startDate: string;
  deadline: string;
  joined: boolean;
  participants?: EventParticipant[];
  createdAt?: string;
  createdBy?: string;
  creator?: EventCreator | null;
  referenceImages?: EventReferenceImage[];
};

export type JoinEventResponse = {
  message?: string;
};