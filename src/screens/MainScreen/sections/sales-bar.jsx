import React from "react";
import { Plus, MoreHorizontal, Minus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";

export function SalesBar() {
  const [selectedTicket, setSelectedTicket] = useState("ticket1");
  const [selectedItem, setSelectedItem] = useState(null);
  const tabsListRef = useRef(null);

  const scrollTabIntoView = (value) => {
    const tabsContainer = tabsListRef.current;
    if (!tabsContainer) return;

    const selectedTab = tabsContainer.querySelector(`[data-value="${value}"]`);
    if (!selectedTab) return;

    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();

    // Check if the tab is partially or fully out of view
    const isTabOutOfView =
      tabRect.left < containerRect.left || tabRect.right > containerRect.right;

    if (isTabOutOfView) {
      selectedTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  };

  const handleTabChange = (value) => {
    setSelectedTicket(value);
    scrollTabIntoView(value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-2 h-14 flex items-center">
        <Tabs
          defaultValue="ticket1"
          className="flex-1 min-w-0"
          onValueChange={handleTabChange}
        >
          <TabsList
            ref={tabsListRef}
            className="w-full justify-start h-auto p-0 bg-transparent overflow-x-auto hide-scrollbar"
          >
            <TabsTrigger
              value="ticket1"
              className="data-[state=active]:bg-accent px-4 py-2"
              data-value="ticket1"
            >
              {
                // no number in the first ticket, reverse the icon
              }
              Ticket Order
            </TabsTrigger>
            <TabsTrigger
              value="ticket2"
              className="data-[state=active]:bg-accent px-4 py-2"
              data-value="ticket2"
            >
              Ticket #2
            </TabsTrigger>
            <TabsTrigger
              value="ticket3"
              className="data-[state=active]:bg-accent px-4 py-2"
              data-value="ticket3"
            >
              Ticket #3
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="sm" className="flex-none bg-background">
          {" "}
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col select-none">
        <table className="w-full products-table">
          <thead
            onClick={() => setSelectedItem(null)}
            className="cursor-default"
          >
            <tr className="text-sm font-medium">
              <th className="text-left px-2 pl-2.5 py-2 w-1/2">Product</th>
              <th className="text-right px-2 py-2 w-1/4">Qty</th>
              <th className="text-right px-2 pr-2.5 py-2 w-1/4">Amt</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                <tr
                  className={`hover:bg-accent/60 cursor-pointer ${
                    selectedItem === i ? "bg-accent/60 hover:bg-accent/60" : ""
                  }`}
                  onClick={() => setSelectedItem(selectedItem === i ? null : i)}
                >
                  <td className="text-left px-2 pl-2.5 py-2">
                    Tortillas H $30
                  </td>
                  <td className="text-right px-2 py-2">9</td>
                  <td className="text-right px-2 pr-2.5 py-2">$20,970</td>
                </tr>
                {selectedItem === i && (
                  <tr className="bg-accent/60">
                    <td className="px-2 pl-2.5 py-2 overflow-hidden">
                      <div className="flex items-center gap-2 justify-start">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-black text-bold"
                        >
                          <MoreHorizontal className="h-2 w-4" />
                        </Button>
                        <span className="text-gray-600 text-sm">options</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 overflow-hidden">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <Minus className="h-2 w-2" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <Plus className="h-2 w-2" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-2 pr-2.5 py-2 ">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-auto text-destructive w-6 h-6"
                        >
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <div className="flex-1 flex" onClick={() => setSelectedItem(null)}>
          &nbsp;
        </div>
        <div className="mt-auto pb-4 pl-3 pr-3 pt-2 flex flex-col items-end border-t-[1.5px]">
          <div className="w-40 mb-2.5 pr-[2px]">
            <div className="flex justify-between items-center text-muted-foreground text-sm h-9">
              <div className="">Subtotal</div>
              <div className="font-bold w-20 text-right">$120</div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground text-sm h-9">
              <div className="">Taxes</div>
              <div className="font-bold w-20 text-right">$30</div>
            </div>

            <div className="flex justify-between items-center h-9">
              <div className="text-sm">Total</div>
              <div className="text-3xl font-bold w-20 text-right">$150</div>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="w-10 h-10">
              <Trash2 />
            </Button>
            <Button variant="outline" className="w-20 h-10">
              HOLD
            </Button>
            <Button className="flex-1 bg-black text-white hover:bg-black/90 h-10">
              PAY
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
