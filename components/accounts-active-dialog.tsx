import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AccountFormData {
  id?: string;
  companyname: string;
  contactperson: string[];
  contactnumber: string[];
  emailaddress: string[];
  address: string;
  area: string;
  status: string;
  deliveryaddress: string;
  typeclient: string;
  actualsales?: number | string;
  date_created?: string;
}

interface UserDetails {
  referenceid: string;
  tsm: string;
  manager: string;
}

interface AccountDialogProps {
  mode: "create" | "edit";
  initialData?: Partial<AccountFormData>;
  userDetails: UserDetails;
  onSaveAction: (data: AccountFormData & UserDetails) => void;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function AccountDialog({
  mode,
  initialData,
  userDetails,
  onSaveAction,
  open,
  onOpenChangeAction,
}: AccountDialogProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    companyname: "",
    contactperson: [],
    contactnumber: [],
    emailaddress: [],
    address: "",
    area: "",
    status: "Active",
    deliveryaddress: "",
    typeclient: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(initialData).map(([key, value]) => {
            if (
              ["contactperson", "contactnumber", "emailaddress"].includes(key) &&
              typeof value === "string"
            ) {
              // Try to parse JSON string first
              try {
                return [key, JSON.parse(value)];
              } catch {
                // fallback: split by comma if not valid JSON
                return [key, value.split(",").map((v) => v.trim()).filter(Boolean)];
              }
            }
            return [key, value ?? ""];
          })
        ),
      }));
    }
  }, [initialData]);

  function handleArrayChange(
    field: "contactperson" | "contactnumber" | "emailaddress",
    index: number,
    value: string
  ) {
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  }

  function handleAddEntry(field: "contactperson" | "contactnumber" | "emailaddress") {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  }

  function handleRemoveEntry(
    field: "contactperson" | "contactnumber" | "emailaddress",
    index: number
  ) {
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      if (updatedArray.length === 1) return prev; // keep at least 1 input visible
      updatedArray.splice(index, 1);
      return { ...prev, [field]: updatedArray };
    });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit() {
    const cleanArray = (arr: string[]) => arr.map(v => v.trim()).filter((v) => v !== "");

    const fullData = {
      ...formData,
      contactperson: cleanArray(formData.contactperson),
      contactnumber: cleanArray(formData.contactnumber),
      emailaddress: cleanArray(formData.emailaddress),
      referenceid: userDetails.referenceid,
      tsm: userDetails.tsm,
      manager: userDetails.manager,
    };

    console.log("Submitting form with cleaned data:", fullData);
    onSaveAction(fullData);
    onOpenChangeAction(false);
  }
  

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button variant="default">Add Account</Button>
        </DialogTrigger>
      )}

      <DialogContent
        style={{ maxWidth: "900px", width: "90vw", maxHeight: "85vh", overflowY: "auto" }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Account" : "Edit Account"}
          </DialogTitle>
          <DialogDescription>
            Please fill out the account information below.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="grid grid-cols-2 gap-6 mt-4"
        >
          <div className="col-span-2">
            <Input
              required
              name="companyname"
              value={formData.companyname ?? ""}
              onChange={handleChange}
              placeholder="Company Name"
            />
          </div>

          {/* Contact Person(s) */}
          <div>
            <label className="font-semibold mb-2 block">Contact Person(s)</label>
            {formData.contactperson.map((cp, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  required
                  value={cp}
                  onChange={(e) => handleArrayChange("contactperson", i, e.target.value)}
                  placeholder="Contact Person"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveEntry("contactperson", i)}
                  disabled={formData.contactperson.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => handleAddEntry("contactperson")}>
              Add Contact Person
            </Button>
          </div>

          {/* Contact Number(s) */}
          <div>
            <label className="font-semibold mb-2 block">Contact Number(s)</label>
            {formData.contactnumber.map((cn, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  required
                  value={cn}
                  onChange={(e) => handleArrayChange("contactnumber", i, e.target.value)}
                  placeholder="Contact Number"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveEntry("contactnumber", i)}
                  disabled={formData.contactnumber.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => handleAddEntry("contactnumber")}>
              Add Contact Number
            </Button>
          </div>

          {/* Email Address(es) */}
          <div>
            <label className="font-semibold mb-2 block">Email Address(es)</label>
            {formData.emailaddress.map((em, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  required
                  type="email"
                  value={em}
                  onChange={(e) => handleArrayChange("emailaddress", i, e.target.value)}
                  placeholder="Email Address"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveEntry("emailaddress", i)}
                  disabled={formData.emailaddress.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => handleAddEntry("emailaddress")}>
              Add Email Address
            </Button>
          </div>

          {/* Rest of the fields */}
          <div>
            <Input
              required
              name="address"
              value={formData.address ?? ""}
              onChange={handleChange}
              placeholder="Address"
            />
          </div>
          <div>
            <Input
              required
              name="deliveryaddress"
              value={formData.deliveryaddress ?? ""}
              onChange={handleChange}
              placeholder="Delivery Address"
            />
          </div>
          <div>
            <Input
              required
              name="area"
              value={formData.area ?? ""}
              onChange={handleChange}
              placeholder="Area"
            />
          </div>
          <div>
            <Input
              required
              name="typeclient"
              value={formData.typeclient ?? ""}
              onChange={handleChange}
              placeholder="Type Client"
            />
          </div>

          <div className="col-span-2">
            <Select
              name="status"
              value={formData.status ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <span>{formData.status}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 flex justify-end">
            <DialogFooter>
              <Button type="submit">{mode === "create" ? "Create" : "Save"}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
