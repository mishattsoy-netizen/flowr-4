import os

filepath = r"c:\Users\misha\Documents\Vibe Coding\flowr-4-main\src\components\admin\RouterManager.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'className="flex items-center gap-2.5 ml-auto"'
replacement = 'className="flex items-center gap-1.5 ml-auto"'

if target in content:
    content = content.replace(target, replacement)
    print("Success: Gap reduced!")
else:
    print("Error: Target gap not found")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching completed!")
