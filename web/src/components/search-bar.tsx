import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";

interface SearchItem {
  id: string | number;
  label: string;
  description?: string;
}

interface SearchBarProps {
  placeholder?: string;
  data: SearchItem[]; 
  value: string; // Pass dynamic value (rooms, bots)
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (item: SearchItem) => void; // on Item click
}

export function SearchBar({ placeholder = "Search...", data, value, onChange, onSelect}: SearchBarProps) {
  const [filteredData, setFilteredData] = useState<SearchItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(value, 200);

  useEffect(() => {
    if (!isFocused) {
      setFilteredData([]);
      return;
    }

    if (!debouncedQuery) {
      setFilteredData(data);
      return;
    }

    const normalizedQuery = debouncedQuery?.toLowerCase().trim() || "R";
    const results = data.filter((item) =>
      item.label?.toLowerCase().includes(normalizedQuery)
    );

    setFilteredData(results);
  }, [debouncedQuery, isFocused, data]);


  return (
    <div className="relative w-full max-w-md">
      {/* Search input */}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 pr-9 py-2 rounded-lg border dark:border-gray-700 focus:ring-primary"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {value.length > 0 ? <Send className="w-5 h-5 text-gray-500" /> : <Search className="w-5 h-5 text-gray-500" />}
        </div>
      </div>

      {/* Animated results dropdown */}
      <AnimatePresence>
        {isFocused && filteredData.length > 0 && (
          <motion.div
            className="absolute top-full mt-2 w-full border rounded-lg shadow-md bg-white dark:bg-black"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex justify-between"
                onClick={() => onSelect(item)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
