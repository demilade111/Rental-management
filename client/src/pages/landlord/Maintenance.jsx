// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import React from "react";

// function Maintenance() {
//   return (
//     <>
//       <Button>Small</Button>
//         <Card className="w-96 p-4"></Card>

//     </>

//   );
// }

// export default Maintenance;
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersVertical,
  Plus,
  Trash2,
  Reply,
  CheckCircle2,
  X,
  Eye,
} from "lucide-react";

function Maintenance() {
  const [search, setSearch] = useState("");

  const columns = [
    { title: "Requests", actions: ["Cancel", "Accept"] },
    { title: "In Progress", actions: ["Reply", "Finish"] },
    { title: "Resolved", actions: ["Trash", "View"] },
  ];

  // Placeholder cards for demo layout
  const sampleCards = Array.from({ length: 3 });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">Maintenance</h1>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border rounded-md px-3 py-1 w-64">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="border-0 focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button variant="outline" size="sm">
            <SlidersVertical className="size-4 mr-2" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Urgent <X className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Property Title <X className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Requests in 30 days <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <Button size="sm">
        <Plus className="size-4 mr-2" /> New Request
      </Button>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.title} className="space-y-4">
            <h2 className="font-semibold text-lg">{col.title}</h2>

            {sampleCards.map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-muted rounded-md" />
                  <div>
                    <CardTitle>Title of the property</CardTitle>
                    <CardDescription>
                      Short address of the property
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      The request day · Urgency level
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm font-medium">
                    Short description of maintenance request from tenant or
                    landlord.
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between">
                  {col.actions.map((action) => (
                    <Button
                      key={action}
                      variant={
                        action === "Cancel" || action === "Trash"
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                    >
                      {action === "Cancel" && <X className="size-4 mr-1" />}
                      {action === "Accept" && (
                        <CheckCircle2 className="size-4 mr-1" />
                      )}
                      {action === "Reply" && <Reply className="size-4 mr-1" />}
                      {action === "Finish" && (
                        <CheckCircle2 className="size-4 mr-1" />
                      )}
                      {action === "Trash" && <Trash2 className="size-4 mr-1" />}
                      {action === "View" && <Eye className="size-4 mr-1" />}
                      {action}
                    </Button>
                  ))}
                </CardFooter>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Maintenance;
