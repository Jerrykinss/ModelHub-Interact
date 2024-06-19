"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";

interface UsernameFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserForm({ setOpen }: UsernameFormProps) {
  // Retrieve stored values
  const storedUsername =
    typeof window !== "undefined" ? localStorage.getItem("user") || "" : "";
  const storedApiKey =
    typeof window !== "undefined" ? localStorage.getItem("key") || "" : "";

  // Initialize form with default values
  const form = useForm({
    defaultValues: {
      username: storedUsername,
      apiKey: storedApiKey,
    },
  });

  const onSubmit = async (values) => {
    try {
      localStorage.setItem("user", values.username);
      localStorage.setItem("key", values.apiKey);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Error saving to localStorage", error);
    } finally {
      setOpen(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenAI API Key</FormLabel>
              <FormControl>
                <Input placeholder="Enter your OpenAI API key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    </Form>
  );
}
