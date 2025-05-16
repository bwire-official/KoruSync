'use client';

import React from 'react';
import { Plus, Filter, SortAsc, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TasksPage(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 relative">
      {/* Header / Control Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
            My Tasks
          </h1>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white hidden lg:flex">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Pillar Filter */}
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Pillar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pillars</SelectItem>
              <SelectItem value="web3">Web3</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Due Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Due Date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              <DropdownMenuItem>Any Date</DropdownMenuItem>
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Tomorrow</DropdownMenuItem>
              <DropdownMenuItem>This Week</DropdownMenuItem>
              <DropdownMenuItem>Next Week</DropdownMenuItem>
              <DropdownMenuItem>Overdue</DropdownMenuItem>
              <DropdownMenuItem>No Due Date</DropdownMenuItem>
              <DropdownMenuItem>Custom Range</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tags Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <Tag className="w-4 h-4 mr-2" />
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              <DropdownMenuItem>All Tags</DropdownMenuItem>
              {/* Tags will be populated dynamically */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              <DropdownMenuItem>Due Date (Ascending)</DropdownMenuItem>
              <DropdownMenuItem>Due Date (Descending)</DropdownMenuItem>
              <DropdownMenuItem>Priority (High to Low)</DropdownMenuItem>
              <DropdownMenuItem>Priority (Low to High)</DropdownMenuItem>
              <DropdownMenuItem>Creation Date (Newest)</DropdownMenuItem>
              <DropdownMenuItem>Creation Date (Oldest)</DropdownMenuItem>
              <DropdownMenuItem>Pillar</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          <Button variant="outline" className="text-gray-500 hover:text-gray-700">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Task List Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Task list will be implemented here */}
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Task list component will be implemented here
        </div>
      </div>
    </div>
  );
} 