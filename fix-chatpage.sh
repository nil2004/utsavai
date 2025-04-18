#!/bin/bash

# Make a backup of the original file
cp src/pages/ChatPage.tsx src/pages/ChatPage.tsx.bak

# Run sed commands to fix the issues
# 1. Fix BudgetInput component
sed -i '' '682d' src/pages/ChatPage.tsx

# 2. Fix extra closing tags in the Input elements
sed -i '' 's/            <\/div>/          <\/div>/g' src/pages/ChatPage.tsx
sed -i '' 's/            <\/Button>/          <\/Button>/g' src/pages/ChatPage.tsx

# 3. Fix indentation in other components
sed -i '' 's/              <\/div>/            <\/div>/g' src/pages/ChatPage.tsx
sed -i '' 's/                      <\/div>/                    <\/div>/g' src/pages/ChatPage.tsx
sed -i '' 's/                    <\/div>/                  <\/div>/g' src/pages/ChatPage.tsx

# 4. Fix message component on line 547
sed -i '' '547s/              <\/div>/      <\/div>/g' src/pages/ChatPage.tsx

# 5. Fix BookingForm component indentation
sed -i '' 's/                    <\/div>/      <\/div>/g' src/pages/ChatPage.tsx
sed -i '' 's/                  <\/Card>/      <\/Card>/g' src/pages/ChatPage.tsx
sed -i '' 's/              <\/div>/      <\/div>/g' src/pages/ChatPage.tsx

echo "ChatPage.tsx has been fixed. A backup was saved to ChatPage.tsx.bak" 