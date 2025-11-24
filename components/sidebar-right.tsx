"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useFormat } from "@/contexts/FormatContext";
import { type DateRange } from "react-day-picker";

type SidebarRightProps = React.ComponentProps<typeof Sidebar> & {
  userId?: string;
  dateCreatedFilterRange: DateRange | undefined;
  setDateCreatedFilterRangeAction: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
};

export function SidebarRight({
  userId,
  dateCreatedFilterRange,
  setDateCreatedFilterRangeAction,
  ...props
}: SidebarRightProps) {
  const { timeFormat, dateFormat } = useFormat();
  const [time, setTime] = React.useState("");
  const [date, setDate] = React.useState("");

  const [userDetails, setUserDetails] = React.useState({
    Firstname: "",
    Lastname: "",
    Position: "",
    profilePicture: "",
  });

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: timeFormat === "12h",
      });

      let formattedDate = "";
      if (dateFormat === "short") {
        formattedDate = now.toLocaleDateString("en-US");
      } else if (dateFormat === "iso") {
        formattedDate = now.toISOString().split("T")[0];
      } else {
        formattedDate = now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }

      setTime(formattedTime);
      setDate(formattedDate);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeFormat, dateFormat]);

  React.useEffect(() => {
    if (!userId) return;
    fetch(`/api/user?id=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        setUserDetails({
          Firstname: data.Firstname || "",
          Lastname: data.Lastname || "",
          Position: data.Position || "",
          profilePicture: data.profilePicture || "",
        });
      })
      .catch((err) => console.error(err));
  }, [userId]);

  function handleDateRangeSelect(range: DateRange | undefined) {
    setDateCreatedFilterRangeAction(range);
  }

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        {userId ? (
          <NavUser
            user={{
              name: `${userDetails.Firstname} ${userDetails.Lastname}`.trim() || "Unknown User",
              position: userDetails.Position,
              avatar: userDetails.profilePicture || "/avatars/shadcn.jpg",
            }}
            userId={userId} 
          />
        ) : (
          <NavUser
            user={{
              name: `${userDetails.Firstname} ${userDetails.Lastname}`.trim() || "Unknown User",
              position: userDetails.Position,
              avatar: userDetails.profilePicture || "/avatars/shadcn.jpg",
            }}
            userId={userId ?? ""} // or pass it here too for consistency
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <DatePicker
          selectedDateRange={dateCreatedFilterRange}
          onDateSelectAction={handleDateRangeSelect}
        />
        <SidebarSeparator className="mx-0" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="border-t border-sidebar-border mt-2 pt-2 text-center text-xs text-muted-foreground">
          <div>{time}</div>
          <div className="text-[11px]">{date}</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
