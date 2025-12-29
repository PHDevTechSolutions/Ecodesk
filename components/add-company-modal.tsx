"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { CancelDialog } from "./activity-cancel-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AddCompanyModalProps {
  referenceid: string;
  onCreated: () => Promise<void>;
}

export function AddCompanyModal({ referenceid, onCreated }: AddCompanyModalProps) {
  const [open, setOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [formData, setFormData] = useState({
    tsm: "",
    company_name: "",
    contact_person: "",
    contact_number: "",
    email_address: "",
    address: "",
    industry: "",
    gender: "Male",
    type_client: "CSR Client",
    manager: null,
    region: null,
    company_group: null,
    status: "Active",
  });

  const [existingCompanies, setExistingCompanies] = useState<
    { company_name: string; contact_person: string }[]
  >([]);
  const [duplicate, setDuplicate] = useState({ contact: false });

  const clientSegments = [
    "Agriculture, Hunting and Forestry",
    "Construction",
    "Data Center",
    "Education",
    "Electricity, Gas and Water",
    "Fishing",
    "Finance and Insurance",
    "Government Offices",
    "Health and Social Work",
    "Hotels and Restaurants",
    "Manufacturing",
    "Mining",
    "Personal Services",
    "Real Estate and Renting",
    "Transport, Storage and Communication",
    "Wholesale and Retail",
  ];

  const genders = ["Male", "Female"];

  // Fetch existing companies when modal opens
  useEffect(() => {
    if (open) {
      fetch("/api/com-fetch-account")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const companies = data.data.map((c: any) => ({
              company_name: (c.company_name ?? "").toLowerCase().trim(),
              contact_person: (c.contact_person ?? "").toLowerCase().trim(),
            }));
            setExistingCompanies(companies);
          }
        });
    }
  }, [open]);

  // Check duplicates whenever company name or contact person changes
  useEffect(() => {
    const name = formData.company_name.toLowerCase().trim();
    const person = formData.contact_person.toLowerCase().trim();
    const isDuplicate = existingCompanies.some(
      (c) => c.company_name === name && c.contact_person === person
    );
    setDuplicate({ contact: isDuplicate });
  }, [formData.company_name, formData.contact_person, existingCompanies]);

  const isFormValid = () => {
    const requiredFields: Array<keyof typeof formData> = [
      "company_name",
      "contact_person",
      "industry",
      "gender",
      "address",
    ];
    const allFilled = requiredFields.every((field) => formData[field]);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      formData.email_address
    );
    const noDuplicate = !duplicate.contact;
    return allFilled && emailValid && noDuplicate;
  };

  const generateAccountReferenceNumber = async (companyName: string): Promise<string> => {
    const prefix = companyName.trim().substring(0, 2).toUpperCase();
    const csrTag = "CSR";

    // Fetch existing account_reference_numbers from your API or database that start with prefix + "-CSR-"
    const res = await fetch(`/api/get-account-references?prefix=${prefix}-${csrTag}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error("Failed to fetch existing account reference numbers");
    }

    // Extract all existing numbers (last 8 digits) from the existing account_reference_numbers
    // and find the max number
    let maxNumber = 0;
    data.references.forEach((ref: string) => {
      const match = ref.match(/^\w{2}-CSR-(\d{8})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });

    // Increment maxNumber by 1 for the new reference number
    const nextNumber = (maxNumber + 1).toString().padStart(8, "0");

    return `${prefix}-${csrTag}-${nextNumber}`;
  };


  const handleSave = async () => {
    if (!isFormValid()) {
      alert("Please fill all required fields correctly and avoid duplicates.");
      return;
    }

    try {
      const gender = genders.includes(formData.gender) ? formData.gender : "Male";

      const accountReferenceNumber = await generateAccountReferenceNumber(
        formData.company_name
      );

      const companyPayload = {
        referenceid,
        account_reference_number: accountReferenceNumber,
        ...formData,
        gender,
        date_created: new Date().toISOString(),
      };

      const companyRes = await fetch("/api/com-save-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyPayload),
      });

      const companyResult = await companyRes.json();
      if (!companyRes.ok) {
        alert("Company save failed: " + (companyResult.error || "Unknown error"));
        return;
      }

      // Save ticket
      const ticketPayload = {
        referenceid,
        account_reference_number: accountReferenceNumber,
        status: "On-Progress",
        date_created: new Date().toISOString(),
      };

      const ticketRes = await fetch("/api/act-save-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketPayload),
      });

      const ticketResult = await ticketRes.json();
      if (!ticketRes.ok) {
        alert("Activity save failed: " + (ticketResult.error || "Unknown error"));
        return;
      }

      toast.success("Company and activity saved successfully");
      setOpen(false);
      resetForm();

      // **IMPORTANT:** Await the parent's fetchCompanies callback here
      await onCreated();
    } catch (err) {
      toast.error("Request failed: " + err);
    }
  };

  const resetForm = () => {
    setFormData({
      tsm: "",
      company_name: "",
      contact_person: "",
      contact_number: "",
      email_address: "",
      address: "",
      industry: "",
      gender: "Male",
      type_client: "CSR Client",
      manager: null,
      region: null,
      company_group: null,
      status: "Active",
    });
    setDuplicate({ contact: false });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
        <DialogTrigger asChild>
          <Button variant="default">Add Account</Button>
        </DialogTrigger>

        <DialogContent
          style={{ maxWidth: "60vw", width: "40vw" }}
          className="mx-auto rounded-lg p-6"
        >
          <DialogHeader>
            <DialogTitle>Add New Accounts</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <FieldSet className="grid grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="col-span-2">
                <Field>
                  <FieldLabel>Company Name *</FieldLabel>
                  <FieldDescription>Enter the registered name of the company.</FieldDescription>
                  <Input
                    placeholder="Enter company name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value.toUpperCase() })
                    }
                    className={duplicate.contact ? "border-red-500" : ""}
                    disabled={showCancelDialog}
                    style={{ textTransform: "uppercase" }}
                  />

                  {duplicate.contact && (
                    <p className="text-red-600 text-sm mt-1">
                      This company with the same contact person already exists!
                    </p>
                  )}
                </Field>
              </div>

              {/* Customer Name */}

              <Field>
                <FieldLabel>Customer Name *</FieldLabel>
                <FieldDescription>
                  Enter the contact person for the company.
                </FieldDescription>
                <Input
                  placeholder="Enter customer name"
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                  className={duplicate.contact ? "border-red-500" : ""}
                  disabled={showCancelDialog}
                  style={{ textTransform: "capitalize" }}
                />
              </Field>

              {/* Gender */}
              <Field>
                <FieldLabel>Gender *</FieldLabel>
                <FieldDescription>Select the gender of the contact person.</FieldDescription>
                <Select
                  value={formData.gender}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, gender: value })
                  }
                  disabled={showCancelDialog}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    {genders.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Contact Number */}
              <Field>
                <FieldLabel>Contact Number *</FieldLabel>
                <FieldDescription>Enter the contact phone number.</FieldDescription>
                <PhoneInput
                  country="ph"
                  value={formData.contact_number}
                  onChange={(value) =>
                    setFormData({ ...formData, contact_number: value })
                  }
                  inputStyle={{ width: "100%", height: "40px" }}
                  dropdownStyle={{ zIndex: 10000 }}
                  disabled={showCancelDialog}
                />
              </Field>

              {/* Email Address */}
              <Field>
                <FieldLabel>Email Address *</FieldLabel>
                <FieldDescription>Enter a valid email address.</FieldDescription>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email_address}
                  onChange={(e) =>
                    setFormData({ ...formData, email_address: e.target.value })
                  }
                  disabled={showCancelDialog}
                />
              </Field>

              {/* Address */}

              <Field>
                <FieldLabel>Address *</FieldLabel>
                <FieldDescription>Enter the full company address.</FieldDescription>
                <Input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={showCancelDialog}
                  style={{ textTransform: "uppercase" }}
                />
              </Field>

              {/* Client Segment */}

              <Field>
                <FieldLabel>Client Segment *</FieldLabel>
                <FieldDescription>Select the industry segment of the client.</FieldDescription>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    setFormData({ ...formData, industry: value })
                  }
                  disabled={showCancelDialog}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client segment" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-auto z-[10000]">
                    {clientSegments.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Save + Cancel Buttons */}
              <div className="col-span-2 flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  variant="default"
                  disabled={!isFormValid() || showCancelDialog}
                >
                  Save Company
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

              </div>
            </FieldSet>
          </FieldGroup>
        </DialogContent>
      </Dialog>
    </>
  );
}
