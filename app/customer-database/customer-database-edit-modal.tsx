"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CancelDialog } from "@/components/activity-cancel-dialog";
import { toast } from "sonner";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any | null;
  onSave: (updated: any) => void;
}

export const CustomerDatabaseEditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account && isOpen) {
      setCompanyName(account.company_name ?? "");
      setContactPerson(account.contact_person ?? "");
      setContactNumber(account.contact_number ?? "");
      setEmailAddress(account.email_address ?? "");
      setAddress(account.address ?? "");
      setRegion(account.region ?? "");
      setIndustry(account.industry ?? "");
    }
  }, [account, isOpen]);

  const handleSave = async () => {
    if (!account?.id) {
      alert("Account id is missing. Cannot save.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/com-edit-account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account.id, // make sure id is included
          referenceid: account.referenceid,
          company_name: companyName,
          contact_person: contactPerson,
          contact_number: contactNumber,
          email_address: emailAddress,
          address: address,
          region: region,
          industry: industry,
          type_client: account.type_client,
          status: account.status,
          company_group: account.company_group,
          date_updated: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update");

      onSave(data.data);
      onClose();
      toast.success("Account successfully updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAttempt = () => setShowCancelDialog(true);
  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    onClose();
  };
  const handleCancelReject = () => setShowCancelDialog(false);
  const isDisabled = showCancelDialog;

  if (!isOpen || !account) return null;

  return (
    <>
      {/* Modal */}
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
        onClick={handleCloseAttempt}
      >
        <div
          className="bg-white rounded-md p-6 max-w-md w-full shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4">Edit Account</h2>

          <div className="flex flex-col gap-4">
            {/* Reference ID (disabled) */}
            <div>
              <Label>Reference ID</Label>
              <Input value={account.referenceid} disabled />
            </div>

            <div>
              <Label>Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Contact Person</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Contact Number</Label>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Region</Label>
              <Input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div>
              <Label>Industry</Label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleCloseAttempt}
                disabled={isDisabled}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || isDisabled}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <CancelDialog
          onConfirm={handleCancelConfirm}
          onCancel={handleCancelReject}
        />
      )}
    </>
  );
};
