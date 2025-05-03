
import React from "react";
import { SitemapEntry } from "@/utils/sitemap";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface SitemapTableProps {
  entries: SitemapEntry[];
}

export function SitemapTable({ entries }: SitemapTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-left p-4">URL</TableHead>
              <TableHead className="text-left p-4">Last Modified</TableHead>
              <TableHead className="text-left p-4">Change Frequency</TableHead>
              <TableHead className="text-left p-4">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <TableCell className="p-4 border-t">
                  <a href={entry.url} className="text-blue-600 hover:underline truncate block max-w-md">
                    {entry.url}
                  </a>
                </TableCell>
                <TableCell className="p-4 border-t">{entry.lastmod || "-"}</TableCell>
                <TableCell className="p-4 border-t">{entry.changefreq || "-"}</TableCell>
                <TableCell className="p-4 border-t">{entry.priority || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
