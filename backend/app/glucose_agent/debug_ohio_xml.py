import xml.etree.ElementTree as ET

file_path = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\datasets\OhioT1DM\559-ws-training.xml"

tree = ET.parse(file_path)
root = tree.getroot()

print("Root tag:", root.tag)
print("Root attributes:", root.attrib)

print("\nDirect children of root:")
for child in root:
    print(" -", child.tag, "| attributes:", child.attrib)

print("\nLooking for 'glucose_level' section:")
glucose_section = root.find("glucose_level")
print("Found:", glucose_section)

if glucose_section is not None:
    events = glucose_section.findall("event")
    print("Number of events found:", len(events))
    if events:
        print("First event attributes:", events[0].attrib)