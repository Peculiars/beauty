"use client";

import { Suspense, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminSearch, useContactSearchFilter } from "@/components/admin";
import { client } from "@/sanity/lib/client";
import { formatDate } from "@/lib/utils";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ContactMessageListProps {
  searchFilter?: string;
}

function ContactMessageList({ searchFilter }: ContactMessageListProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const batchSize = 30;

  const fetchMessages = async (offset = 0) => {
    setIsLoading(true);

    try {
      let query = '*[_type == "contactMessage"';
      if (searchFilter) query += ` && (${searchFilter})`;
      query += `] | order(createdAt desc)[${offset}...${offset + batchSize}]{
        _id,
        name,
        email,
        subject,
        message,
        createdAt
      }`;

      const result: ContactMessage[] = await client.fetch(query);
      setMessages((prev) => (offset === 0 ? result : [...prev, ...result]));
      setHasMore(result.length === batchSize);
    } catch (error) {
      console.error("Failed to load contact messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(0);
  }, [searchFilter]);

  if (isLoading && messages.length === 0) {
    return <ContactMessageListSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No messages yet"
        description={
          searchFilter
            ? "No messages match your search. Try another term."
            : "Messages will show here when visitors contact you."
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">From</TableHead>
              <TableHead className="w-[30%]">Subject</TableHead>
              <TableHead className="hidden lg:table-cell">Message</TableHead>
              <TableHead className="text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message._id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <TableCell className="py-3 sm:py-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{message.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{message.email}</div>
                </TableCell>
                <TableCell className="py-3 sm:py-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{message.subject}</div>
                </TableCell>
                <TableCell className="hidden py-4 text-zinc-500 dark:text-zinc-400 lg:table-cell">
                  {message.message.length > 100 ? `${message.message.slice(0, 100)}…` : message.message}
                </TableCell>
                <TableCell className="py-3 sm:py-4 text-right text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(message.createdAt, "short")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchMessages(messages.length)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load more messages"}
          </Button>
        </div>
      )}
    </>
  );
}

function ContactMessageListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">From</TableHead>
            <TableHead className="w-[30%]">Subject</TableHead>
            <TableHead className="hidden lg:table-cell">Message</TableHead>
            <TableHead className="text-right">Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((index) => (
            <TableRow key={index}>
              <TableCell className="py-4">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800"></div>
              </TableCell>
              <TableCell className="py-4">
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800"></div>
              </TableCell>
              <TableCell className="hidden py-4 lg:table-cell">
                <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ContactMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { filter: searchFilter, isSearching } = useContactSearchFilter(searchQuery);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Contact Messages
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Review messages submitted through the contact form.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch
          placeholder="Search by name, email, subject, or message..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:w-96"
        />
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {isSearching ? "Searching…" : "Showing latest messages."}
        </div>
      </div>

      <Suspense fallback={<ContactMessageListSkeleton />}>
        <ContactMessageList searchFilter={searchFilter} />
      </Suspense>
    </div>
  );
}
