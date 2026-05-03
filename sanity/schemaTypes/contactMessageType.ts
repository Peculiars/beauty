import { defineField, defineType } from "sanity";

export const contactMessageType = defineType({
  name: "contactMessage",
  title: "Contact Message",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().error("A name is required"),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => [
        rule.required().error("An email address is required"),
        rule.email().error("Enter a valid email address"),
      ],
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description: "Optional phone number for follow-up",
    }),
    defineField({
      name: "subject",
      title: "Subject",
      type: "string",
      validation: (rule) => rule.required().error("A subject is required"),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      validation: (rule) => rule.required().error("A message is required"),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Read", value: "read" },
        ],
      },
      initialValue: "new",
    }),
  ],
  preview: {
    select: {
      title: "subject",
      subtitle: "email",
      description: "message",
    },
  },
});
