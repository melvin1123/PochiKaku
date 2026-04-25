"use client";

import MainLayout from "@/components/main-components/layout/MainLayout";
import EventsHeader from "@/components/main-components/events/EventsHeader";
import EventsGrid from "@/components/main-components/events/EventsGrid";
import EventCreationModal from "@/components/main-components/events/EventCreationModal";
import ViewEventModal from "@/components/main-components/events/ViewEventModal";
import { useEvents } from "@/app/hooks/events/useEvents";

export default function EventsPage() {
  const {
    events,
    selectedEvent,
    isCreateModalOpen,
    joiningEventId,
    isLoading,
    hasError,
    isEmpty,
    hasEvents,
    error,
    openCreateModal,
    closeCreateModal,
    openViewModal,
    closeViewModal,
    handleCreated,
    handleJoinEvent,
    loadEvents,
  } = useEvents();

  return (
    <MainLayout>
      <div className="mt-1 flex min-h-fit flex-col">
        <EventsHeader onCreate={openCreateModal} />

        <EventCreationModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreated={handleCreated}
        />

        <ViewEventModal
          isOpen={Boolean(selectedEvent)}
          onClose={closeViewModal}
          event={selectedEvent}
          onJoin={() => {
            if (!selectedEvent) return;
            void handleJoinEvent(selectedEvent);
          }}
          hasJoined={selectedEvent?.joined ?? false}
          isJoining={joiningEventId === selectedEvent?.id}
        />

        <section className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {isLoading && <LoadingState />}

            {hasError && <ErrorState error={error} onRetry={loadEvents} />}

            {isEmpty && <EmptyState onCreate={openCreateModal} />}

            {hasEvents && (
              <EventsGrid
                events={events}
                onView={openViewModal}
                onJoin={handleJoinEvent}
                joiningEventId={joiningEventId}
              />
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-5 text-sm text-[#5a4636] sm:p-6 sm:text-base">
      Loading events...
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-red-300 bg-red-50 p-5 sm:p-6">
      <p className="text-sm text-red-700 sm:text-base">{error}</p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
      No events found.
      <div className="mt-4">
        <button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
        >
          Create Event
        </button>
      </div>
    </div>
  );
}