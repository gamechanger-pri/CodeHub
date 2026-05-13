import React, { useState } from "react";
import { TagsInput } from "react-tag-input-component";

function TagInput({ tags, setTags }) {
  return (
    <div style={{ margin: "10px 0" }}>
      <TagsInput
        value={tags}
        onChange={setTags}
        name="tags"
        placeHolder="Enter tags"
      />
    </div>
  );
}

export default TagInput;